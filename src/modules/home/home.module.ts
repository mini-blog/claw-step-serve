import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { PetModule } from '../pet/pet.module';
import { CityModule } from '../city/city.module';
import { TravelModule } from '../travel/travel.module';

@Module({
  imports: [PetModule, CityModule, TravelModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService]
})
export class HomeModule {}

