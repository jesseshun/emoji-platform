import { Injectable } from '@nestjs/common';
import { SearchService } from '../search/search.service';
import { SearchInfrastructureStatus } from '../search/search.types';

/**
 * Admin-facing read-only search infrastructure service (Phase 6B).
 * Delegates to SearchService so the reported status always reflects the
 * provider actually selected at runtime, including real Meilisearch reachability.
 */
@Injectable()
export class AdminSearchInfrastructureService {
  constructor(private readonly searchService: SearchService) {}

  getStatus(): Promise<SearchInfrastructureStatus> {
    return this.searchService.getInfrastructureStatus();
  }
}
