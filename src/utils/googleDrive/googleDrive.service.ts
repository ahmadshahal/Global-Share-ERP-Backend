import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drive_v3, google } from 'googleapis';
import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';

type PartialDriveFile = {
    id: string;
    name: string;
};

type SearchResultResponse = {
    kind: 'drive#fileList';
    nextPageToken: string;
    incompleteSearch: boolean;
    files: PartialDriveFile[];
};
@Injectable()
export class GoogleDriveService {
    private driveClient: drive_v3.Drive;

    public constructor(configService: ConfigService) {
        this.driveClient = this.createDriveClient(
            configService.get('DRIVE_CLIENT_ID'),
            configService.get('DRIVE_CLIENT_SECRET'),
            configService.get('DRIVE_REDIRECT_URI'),
            configService.get('DRIVE_REFRESH_TOKEN'),
        );
    }

    createDriveClient(
        clientId: string,
        clientSecret: string,
        redirectUri: string,
        refreshToken: string,
    ) {
        const client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri,
        );

        client.setCredentials({ refresh_token: refreshToken });

        return google.drive({
            version: 'v3',
            auth: client,
        });
    }

    createFolder = (
        folderName: string,
    ): Promise<PartialDriveFile> | GaxiosPromise<drive_v3.Schema$File> => {
        return this.driveClient.files.create({
            requestBody: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id, name',
        });
    };

    searchFolder = (driveClient, folderName) => {
        return new Promise((resolve, reject) => {
            driveClient.files.list(
                {
                    q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
                    fields: 'files(id, name)',
                },
                (err, res) => {
                    if (err) {
                        reject(`Error searching for folder: ${err}`);
                        return;
                    }

                    const files = res?.data?.files;

                    if (!files || files.length === 0) {
                        reject(`Folder not found: ${folderName}`);
                        return;
                    }

                    resolve(files[0]);
                },
            );
        });
    };

    saveFile = (
        fileName: string,
        file: any,
        fileMimeType: string,
        folderId?: string,
    ) => {
        return this.driveClient.files.create({
            requestBody: {
                name: fileName,
                mimeType: fileMimeType,
                parents: folderId ? [folderId] : [],
            },
            media: {
                mimeType: fileMimeType,
                body: file,
            },
        });
    };
}
