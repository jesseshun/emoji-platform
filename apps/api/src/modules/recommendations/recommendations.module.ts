import { Module } from '@nestjs/common';
import { RecommendationController } from './recommendations.controller';
import { RecommendationService } from './recommendations.service';

@Module({
  controllers: [RecommendationController],
  providers: [RecommendationService],
  exports: [RecommendationService],
})
export class RecommendationModule {}
