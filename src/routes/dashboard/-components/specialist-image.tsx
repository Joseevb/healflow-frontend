import { Image } from "@unpic/react";
import { User } from "lucide-react";

interface SpecialistImageProps {
  profilePictureName: string | null | undefined;
  name: string;
}

// Use import.meta.env for Vite, or hardcode
const BASE_URL = import.meta.env.VITE_PUBLIC_IMAGE_BASE_URL || "/uploads";

export function SpecialistImage({ profilePictureName, name }: SpecialistImageProps) {
  if (!profilePictureName) {
    return (
      <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
        <User className="size-6 text-blue-600" />
      </div>
    );
  }

  return (
    <Image
      src={`${BASE_URL}/${profilePictureName}`}
      width={48}
      height={48}
      alt={name}
      className="size-12 rounded-xl object-cover"
      onError={(e) => {
        e.currentTarget.style.display = "none";
        e.currentTarget.parentElement?.classList.add("fallback-icon");
      }}
    />
  );
}
