export async function fetchCms(path, headers = {}) {
  const { AAMMOUR_CMS_URL, AAMMOUR_SITES_SERVICE_TOKEN, AAMMOUR_STOREFRONT_READ_KEY } = process.env;
  if (!AAMMOUR_CMS_URL || !AAMMOUR_SITES_SERVICE_TOKEN || !AAMMOUR_STOREFRONT_READ_KEY) {
    throw new Error('CMS connection is not configured');
  }
  return fetch(new URL(path, AAMMOUR_CMS_URL), {
    headers: { ...headers, 'OAI-Sites-Authorization': 'Bearer ' + AAMMOUR_SITES_SERVICE_TOKEN, Authorization: 'Bearer ' + AAMMOUR_STOREFRONT_READ_KEY },
    redirect: 'error',
    signal: AbortSignal.timeout(4500)
  });
}
