import { Module } from '@nestjs/common';
import { GoogleDriveService } from './googleDrive.service';
import { ConfigService } from '@nestjs/config';

@Module({
    providers: [
        GoogleDriveService,
        // {
        //     provide: 'GOOGLE_DRIVE',
        //     useFactory: (configService: ConfigService) => ({
        //         clientId: configService.get('DRIVE_CLIENT_ID'),
        //         clientSecret: configService.get('DRIVE_CLIENT_SECRET'),
        //         redirectUri: configService.get('DRIVE_REDIRECT_URI'),
        //         refreshToken: configService.get('DRIVE_REFRESH_TOKEN'),
        //     }),
        //     inject: [ConfigService],
        // },
    ],
})
export class GoogleDriveModule {}
