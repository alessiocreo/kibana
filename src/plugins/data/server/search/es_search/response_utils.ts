/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * and the Server Side Public License, v 1; you may not use this file except in
 * compliance with, at your election, the Elastic License or the Server Side
 * Public License, v 1.
 */

import { SearchResponse } from 'elasticsearch';
import { ISearchOptions } from '../../../common';

/**
 * Get the `total`/`loaded` for this response (see `IKibanaSearchResponse`). Note that `skipped` is
 * not included as it is already included in `successful`.
 * @internal
 */
export function getTotalLoaded(response: SearchResponse<unknown>) {
  const { total, failed, successful } = response._shards;
  const loaded = failed + successful;
  return { total, loaded };
}

/**
 * Get the Kibana representation of this response (see `IKibanaSearchResponse`).
 * @internal
 */
export function toKibanaSearchResponse(rawResponse: SearchResponse<unknown>) {
  return {
    rawResponse,
    isPartial: false,
    isRunning: false,
    ...getTotalLoaded(rawResponse),
  };
}

/**
 * Temporary workaround until https://github.com/elastic/kibana/issues/26356 is addressed.
 * Since we are setting `track_total_hits` in the request, `hits.total` will be an object
 * containing the `value`.
 *
 * @internal
 */
export function shimHitsTotal(
  response: SearchResponse<unknown>,
  { legacyHitsTotal = true }: ISearchOptions = {}
) {
  if (!legacyHitsTotal) return response;
  const total = (response.hits?.total as any)?.value ?? response.hits?.total;
  const hits = { ...response.hits, total };
  return { ...response, hits };
}
