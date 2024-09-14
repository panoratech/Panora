import { IdentitySet } from '@filestorage/drive/services/sharepoint/types';
import {
  Deleted,
  FileSystemInfo,
  ItemReference,
} from '@filestorage/folder/services/sharepoint/types';
import { SharepointPermissionOutput } from '@filestorage/permission/services/sharepoint/types';

/**
 * Represents the input for a folder item in Sharepoint.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0
 */
export interface SharepointFileOutput {
  /** The unique identifier of the item within the Drive. */
  readonly id?: string;
  /** The name of the item (filename and extension). */
  name?: string;
  /** The URL that displays the resource in the browser. */
  readonly webUrl?: string;
  /** File system information on the client. */
  fileSystemInfo?: FileSystemInfo;
  /** Parent information, if the item has a parent. */
  parentReference?: ItemReference;
  /** The unique identifier of the drive instance that contains the driveItem. */
  readonly driveId?: string;
  /** Identifies the type of drive. */
  readonly driveType?: string;
  /** Information about the deleted state of the item. */
  deleted?: Deleted;
  /** Description of the item. */
  description?: string;
  /** Permissions associated with the folder. */
  permissions?: SharepointPermissionOutput[];
  /** Date and time the item was last modified. Read-only. */
  readonly lastModifiedDateTime?: string;
  /** Size of the item in bytes. Read-only. */
  readonly size?: number;
  /** Identity of the user, device, and application that created the item. Read-only. */
  readonly createdBy?: IdentitySet;
  /** Identity of the user, device, and application that last modified the item. Read-only. */
  readonly lastModifiedBy?: IdentitySet;
  /** Date and time of item creation. Read-only. */
  readonly createdDateTime?: string;
  /** File metadata Read-only. */
  readonly file: File;
  /** Audio metadata, if the item is an audio file. Read-only. Read-only. Only on OneDrive Personal. */
  readonly audio?: Audio;
  /** Bundle metadata, if the item is a bundle. Read-only. */
  readonly bundle?: Bundle;
  /** The content stream, if the item represents a file. */
  content?: string;
  /** Image metadata, if the item is an image. Read-only. */
  readonly image?: Image;
  /** Photo metadata, if the item is a photo. Read-only. */
  readonly photo?: Photo;
  /** Video metadata, if the item is a video. Read-only. */
  readonly video?: Video;
  /** WebDAV compatible URL for the item. */
  readonly webDavUrl?: string;
}

/**
 * Represents the input for a folder item in OneDrive.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/file?view=graph-rest-1.0
 */
export interface File {
  /**The MIME type for the file. This is determined by logic on the server and might not be the value provided when the file was uploaded. Read-only. */
  mimeType: string;
  /** Hashes of the file's binary content, if available. Read-only. */
  hashes?: Hashes;
}

/**
 * The hashes resource groups available hashes into a single structure for an item.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/hashes?view=graph-rest-1.0
 */
export interface Hashes {
  /** The CRC32 value of the file in little endian (if available). Read-only. */
  readonly crc32Hash?: string;
  /** A proprietary hash of the file that can be used to determine if the contents of the file have changed (if available). Read-only. */
  readonly quickXorHash?: string;
  /** SHA1 hash for the contents of the file (if available). Read-only. */
  readonly sha1Hash?: string;
  /** SHA256 hash for the contents of the file (if available). Read-only. */
  readonly sha256Hash?: string;
}

/**
 * Represents metadata for an audio file.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/audio?view=graph-rest-1.0
 */
export interface Audio {
  /** The title of the album for this audio file. */
  album?: string;
  /** The artist named on the album for the audio file. */
  albumArtist?: string;
  /** The performing artist for the audio file. */
  artist?: string;
  /** Bitrate expressed in kbps. */
  bitrate?: number;
  /** The name of the composer of the audio file. */
  composers?: string;
  /** Copyright information for the audio file. */
  copyright?: string;
  /** The number of the disc this audio file came from. */
  disc?: number;
  /** The total number of discs in this album. */
  discCount?: number;
  /** Duration of the audio file, expressed in milliseconds. */
  duration?: number;
  /** The genre of this audio file. */
  genre?: string;
  /** Indicates if the file is protected with digital rights management. */
  hasDrm?: boolean;
  /** Indicates if the file is encoded with a variable bitrate. */
  isVariableBitrate?: boolean;
  /** The title of the audio file. */
  title?: string;
  /** The number of the track on the original disc for this audio file. */
  track?: number;
  /** The total number of tracks on the original disc for this audio file. */
  trackCount?: number;
  /** The year the audio file was recorded. */
  year?: number;
}

/**
 * Represents metadata for a bundle.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/bundle?view=graph-rest-1.0
 */
export interface Bundle {
  /** If the bundle is an album, then the album property is included. */
  album?: Album;
  /** Number of children contained immediately within this container. */
  childCount?: number;
}

/**
 * Represents album-specific metadata for a bundle.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/album?view=graph-rest-1.0
 */
export interface Album {
  /** Unique identifier of the driveItem that is the cover of the album. */
  coverImageItemId?: string;
}

/**
 * Represents metadata for an image.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/image?view=graph-rest-1.0
 */
export interface Image {
  /** Optional. Height of the image, in pixels. Read-only. */
  readonly height?: number;
  /** Optional. Width of the image, in pixels. Read-only. */
  readonly width?: number;
}

/**
 * Represents metadata for a photo.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/photo?view=graph-rest-1.0
 */
export interface Photo {
  /** Camera manufacturer. Read-only. */
  readonly cameraMake?: string;
  /** Camera model. Read-only. */
  readonly cameraModel?: string;
  /** The denominator for the exposure time fraction from the camera. Read-only. */
  readonly exposureDenominator?: number;
  /** The numerator for the exposure time fraction from the camera. Read-only. */
  readonly exposureNumerator?: number;
  /** The F-stop value from the camera. Read-only. */
  readonly fNumber?: number;
  /** The focal length from the camera. Read-only. */
  readonly focalLength?: number;
  /** The ISO value from the camera. Read-only. */
  readonly iso?: number;
  /** The orientation value from the camera. Writable on OneDrive Personal. */
  orientation?: number;
  /** Represents the date and time the photo was taken. Read-only. */
  readonly takenDateTime?: string;
}

/**
 * Represents metadata for a video file.
 * @see https://learn.microsoft.com/en-us/graph/api/resources/video?view=graph-rest-1.0
 */
export interface Video {
  /** Number of audio bits per sample. */
  audioBitsPerSample?: number;
  /** Number of audio channels. */
  audioChannels?: number;
  /** Name of the audio format (AAC, MP3, etc.). */
  audioFormat?: string;
  /** Number of audio samples per second. */
  audioSamplesPerSecond?: number;
  /** Bit rate of the video in bits per second. */
  bitrate?: number;
  /** Duration of the file in milliseconds. */
  duration?: number;
  /** "Four character code" name of the video format. */
  fourCC?: string;
  /** Frame rate of the video. */
  frameRate?: number;
  /** Height of the video, in pixels. */
  height?: number;
  /** Width of the video, in pixels. */
  width?: number;
}

export type SharepointFileInput = Partial<SharepointFileOutput>;
