import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchIndexService } from './search-index.service';

@Module({
  controllers: [SearchController],
  providers: [SearchService, SearchIndexService],
  exports: [SearchService, SearchIndexService],
})
export class SearchModule {}
