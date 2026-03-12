import ProfileSection from "@/components/sections/ProfileSection/ProfileSection";
import TrainerProfile from "@/components/sections/ProfileSection/TrainerProfile/TrainerProfile";

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <ProfileSection>
      <TrainerProfile />
    </ProfileSection>
  );
}
