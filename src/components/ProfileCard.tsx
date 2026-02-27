/**
 * ProfileCard component
 * Displays user profile with photo carousel and info overlay
 */

'use client';

import { Card, CardBody, CardFooter, Image, Button } from '@nextui-org/react';

export interface ProfileData {
  id: string;
  name: string;
  age: number;
  height?: number;
  city: string;
  region: string;
  education?: string;
  occupation?: string;
  religionLevel?: string;
  about?: string;
  photos: string[];
}

interface ProfileCardProps {
  profile: ProfileData;
  onLike?: () => void;
  onPass?: () => void;
  onOpenDetail?: () => void;
  showActions?: boolean;
  actionsDisabled?: boolean;
}

export default function ProfileCard({ profile, onLike, onPass, onOpenDetail, showActions = true, actionsDisabled = false }: ProfileCardProps) {
  const mainPhoto = profile.photos.length > 0 ? profile.photos[0] : '/placeholder-avatar.png';

  return (
    <Card className="w-full max-w-[400px] mx-auto shadow-soft">
      <CardBody className="p-0">
        <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden">
          <Image
            src={mainPhoto}
            alt={`${profile.name} main photo`}
            className="w-full h-full object-cover"
            classNames={{
              wrapper: 'w-full h-full',
              img: 'w-full h-full object-cover',
            }}
          />
        </div>

        <div className="px-4 py-4 space-y-3">
          <h2 className="text-xl font-semibold">
            {profile.name}, {profile.age}
          </h2>
          <p className="text-sm text-text-secondary line-clamp-3 whitespace-pre-wrap">{profile.about || 'No about information yet.'}</p>
          {onOpenDetail && (
            <Button variant="flat" color="primary" onPress={onOpenDetail} className="w-full">
              Detail
            </Button>
          )}
        </div>
      </CardBody>

      {/* Action buttons */}
      {showActions && onPass && onLike && (
        <CardFooter className="gap-4 justify-center py-4">
          <Button isIconOnly size="lg" variant="flat" onPress={onPass} isDisabled={actionsDisabled} className="w-14 h-14 bg-gray-100 hover:bg-gray-200 text-gray-600">
            <span className="text-2xl">✕</span>
          </Button>
          <Button
            isIconOnly
            size="lg"
            color="success"
            variant="flat"
            onPress={onLike}
            isDisabled={actionsDisabled}
            className="w-14 h-14 bg-primary/10 hover:bg-primary/20 text-primary"
          >
            <span className="text-2xl">♥</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
