/**
 * YouTube Data API v3 Client & Verified B.Tech Lecture Engine (Server-Side Secured)
 * ----------------------------------------------------------------------------------
 * SECURITY GUARANTEE:
 * - NO YouTube API keys are stored in frontend JavaScript or localStorage.
 * - All live requests route through the backend proxy (/api/youtube).
 * - YOUTUBE_API_KEY is kept strictly on the server (.env / server environment).
 * - Automatic graceful fallback to verified, curated real B.Tech lectures when
 *   YOUTUBE_API_KEY is not configured or when quota is reached.
 */

import { BTECH_SUBJECTS_CATALOG, getSubjectDetails } from '../data/btechCurriculum.js';

/**
 * Parses ISO 8601 duration format (e.g., PT1H23M45S) into human readable time (e.g., 1h 23m)
 */
export function formatIsoDuration(isoDuration) {
  if (!isoDuration) return 'Lecture';
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return isoDuration;

  const hours = match[1] ? `${match[1]}h ` : '';
  const minutes = match[2] ? `${match[2]}m` : match[1] ? '0m' : '';
  const seconds = match[3] && !match[1] ? ` ${match[3]}s` : '';
  return (hours + minutes + seconds).trim() || 'Video';
}

/**
 * Searches YouTube for lectures via the secure backend proxy (/api/youtube/search)
 * 
 * @param {Object} opts
 * @param {string} opts.query - Search query string
 * @param {string} [opts.pageToken] - For pagination (load more)
 * @param {number} [opts.maxResults=8] - Number of items to fetch
 */
export async function searchYouTubeLectures({
  query,
  pageToken = '',
  maxResults = 8
}) {
  try {
    const searchTerms = `${query} B.Tech lecture engineering gate`;
    let url = `/api/youtube/search?part=snippet&type=video&videoEmbeddable=true&q=${encodeURIComponent(searchTerms)}&maxResults=${maxResults}`;
    if (pageToken) {
      url += `&pageToken=${encodeURIComponent(pageToken)}`;
    }

    const res = await fetch(url);

    // If server returned 503 (key not configured) or quota exceeded, fall back to curated lectures
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const isMissingKey = res.status === 503;
      const isQuota = res.status === 403 || res.status === 429;

      let warningMsg = "Showing verified curated B.Tech lectures catalog.";
      if (isMissingKey) {
        warningMsg = "Server YOUTUBE_API_KEY is not configured. Displaying verified curated B.Tech lectures.";
      } else if (isQuota) {
        warningMsg = "YouTube API quota reached. Displaying verified curated B.Tech lectures.";
      }

      return {
        items: getCuratedFallbackLectures(query).items,
        nextPageToken: null,
        isLiveApi: false,
        warning: warningMsg
      };
    }

    const data = await res.json();
    const videoItems = (data.items || []).filter(item => item.id?.videoId);

    // Fetch video durations via server proxy
    const videoIds = videoItems.map(item => item.id.videoId).join(',');
    let durationsMap = {};

    if (videoIds) {
      try {
        const detailsRes = await fetch(
          `/api/youtube/videos?part=contentDetails,snippet&id=${encodeURIComponent(videoIds)}`
        );
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json();
          (detailsData.items || []).forEach(v => {
            durationsMap[v.id] = formatIsoDuration(v.contentDetails?.duration);
          });
        }
      } catch (e) {
        console.warn("Could not fetch video duration details:", e);
      }
    }

    const formattedLectures = videoItems.map(item => {
      const vid = item.id.videoId;
      return {
        id: vid,
        youtubeId: vid,
        title: item.snippet.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        channel: item.snippet.channelTitle,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt?.split('T')[0] || '',
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        duration: durationsMap[vid] || 'Lecture',
        isLive: true
      };
    });

    return {
      items: formattedLectures,
      nextPageToken: data.nextPageToken || null,
      totalResults: data.pageInfo?.totalResults || formattedLectures.length,
      isLiveApi: true
    };
  } catch (err) {
    return {
      items: getCuratedFallbackLectures(query).items,
      nextPageToken: null,
      isLiveApi: false,
      warning: "Could not reach YouTube API service. Showing verified curated B.Tech lectures."
    };
  }
}

/**
 * Searches for playlists for a subject or topic via secure server proxy
 */
export async function searchYouTubePlaylists({
  query,
  maxResults = 5
}) {
  try {
    const url = `/api/youtube/search?part=snippet&type=playlist&q=${encodeURIComponent(query + ' playlist engineering')}&maxResults=${maxResults}`;
    const res = await fetch(url);
    if (!res.ok) return { items: [], isLiveApi: false };

    const data = await res.json();
    const items = (data.items || []).map(p => ({
      id: p.id.playlistId,
      playlistId: p.id.playlistId,
      title: p.snippet.title.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
      channel: p.snippet.channelTitle,
      thumbnail: p.snippet.thumbnails?.medium?.url || p.snippet.thumbnails?.default?.url,
      description: p.snippet.description
    }));

    return { items, isLiveApi: true };
  } catch (e) {
    return { items: [], isLiveApi: false };
  }
}

/**
 * Provides curated, real YouTube lectures from our verified catalog
 */
function getCuratedFallbackLectures(query) {
  const q = (query || '').toLowerCase().trim();
  const allCurated = [];

  for (const s of BTECH_SUBJECTS_CATALOG) {
    const full = getSubjectDetails(s.id);
    if (!full || !full.units) continue;

    for (const unit of full.units) {
      if (unit.lectures) {
        for (const lec of unit.lectures) {
          allCurated.push({
            id: lec.id || lec.youtubeId,
            youtubeId: lec.youtubeId,
            title: lec.title,
            channel: lec.channel || 'Verified University Educator',
            duration: lec.duration || 'Lecture',
            subject: full.name,
            semester: full.semester,
            unitNumber: unit.unitNumber,
            unitTitle: unit.title,
            notes: lec.notes || '',
            thumbnail: `https://img.youtube.com/vi/${lec.youtubeId}/hqdefault.jpg`,
            isLive: false
          });
        }
      }
    }
  }

  if (!q) {
    return {
      items: allCurated.slice(0, 10),
      nextPageToken: null,
      isLiveApi: false,
      warning: "Displaying verified curated B.Tech lectures from Gate Smashers, Neso Academy, and Striver."
    };
  }

  const matched = allCurated.filter(item => {
    return item.title.toLowerCase().includes(q) ||
           item.subject.toLowerCase().includes(q) ||
           item.channel.toLowerCase().includes(q) ||
           item.unitTitle.toLowerCase().includes(q) ||
           (item.notes && item.notes.toLowerCase().includes(q));
  });

  const finalItems = matched.length > 0 ? matched : allCurated.slice(0, 8);

  return {
    items: finalItems,
    nextPageToken: null,
    isLiveApi: false,
    warning: "Displaying verified curated B.Tech lectures from Gate Smashers, Neso Academy, and Striver."
  };
}
