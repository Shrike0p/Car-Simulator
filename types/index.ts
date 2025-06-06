export interface SketchfabModel {
    uid: string;
    name: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    thumbnails: {
        images: Array<{
            url: string;
            width: number;
            height: number;
            size: number;
        }>;
    };
    archives?: {
        glb: {
            size: number;
        };
    };
    user: {
        username: string;
        displayName: string;
    };
    isDownloadable: boolean;
    categories: Array<{ name: string }>;
    embedUrl: string;
}

