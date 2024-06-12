import { Module } from '@nestjs/common';
import { ResController } from './res/res.controller';
import { ResService } from './res/res.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { BookController } from './book/book.controller';
import { BookService } from './book/Book.service';

@Module({
  imports: [
    HttpModule,
    JwtModule.register({ secret: '1234' }),
    ConfigModule.forRoot({
      envFilePath:
        '/Users/vijayrakeshchandra/Desktop/previous/api_endpoint/nestapp/src/.env',
      isGlobal: true,
    })
  ],
  controllers: [ResController, BookController],
  providers: [ResService, BookService],
})
export class AppModule {}
