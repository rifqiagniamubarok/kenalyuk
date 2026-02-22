/**
 * ProfileCard component
 * Displays user profile with photo carousel and info overlay
 */

'use client';

import { useState } from 'react';
import { Card, CardBody, CardFooter, Image, Button, Accordion, AccordionItem } from '@nextui-org/react';
import { motion, AnimatePresence } from 'framer-motion';

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
  showActions?: boolean;
  actionsDisabled?: boolean;
}

export default function ProfileCard({ profile, onLike, onPass, showActions = true, actionsDisabled = false }: ProfileCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = profile.photos.length > 0 ? profile.photos : ['/placeholder-avatar.png'];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Card className="w-full max-w-[400px] mx-auto">
      <CardBody className="p-0 relative">
        {/* Photo carousel */}
        <div className="relative aspect-[3/4] bg-gray-100">
          <AnimatePresence mode="wait">
            <motion.div key={currentPhotoIndex} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
              <Image
                src={photos[currentPhotoIndex]}
                alt={`${profile.name} - Photo ${currentPhotoIndex + 1}`}
                className="w-full h-full object-cover"
                classNames={{
                  wrapper: 'w-full h-full',
                  img: 'w-full h-full object-cover',
                }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Photo navigation buttons */}
          {photos.length > 1 && (
            <>
              <Button isIconOnly size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onPress={prevPhoto}>
                ‹
              </Button>
              <Button isIconOnly size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white" onPress={nextPhoto}>
                ›
              </Button>
            </>
          )}

          {/* Photo indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, idx) => (
                <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'}`} />
              ))}
            </div>
          )}

          {/* Profile info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 pt-12">
            <h2 className="text-white text-2xl font-bold">
              {profile.name}, {profile.age}
            </h2>
            <div className="text-white/90 text-sm mt-1 space-y-0.5">
              <p>
                📍 {profile.city}, {profile.region}
              </p>
              {profile.height && <p>📏 {profile.height} cm</p>}
              {profile.education && <p>🎓 {profile.education}</p>}
              {profile.occupation && <p>💼 {profile.occupation}</p>}
              {profile.religionLevel && <p>🕌 {profile.religionLevel}</p>}
            </div>
          </div>
        </div>

        {/* Expandable About section */}
        {profile.about && (
          <Accordion className="px-4 py-2">
            <AccordionItem key="about" aria-label="About" title="About" className="text-sm">
              <p className="text-gray-700 whitespace-pre-wrap">{profile.about}</p>
            </AccordionItem>
          </Accordion>
        )}
      </CardBody>

      {/* Action buttons */}
      {showActions && (
        <CardFooter className="gap-4 justify-center py-4">
          <Button isIconOnly size="lg" color="danger" variant="flat" onPress={onPass} isDisabled={actionsDisabled} className="w-14 h-14">
            <span className="text-2xl">✕</span>
          </Button>
          <Button isIconOnly size="lg" color="success" variant="flat" onPress={onLike} isDisabled={actionsDisabled} className="w-14 h-14">
            <span className="text-2xl">♥</span>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
