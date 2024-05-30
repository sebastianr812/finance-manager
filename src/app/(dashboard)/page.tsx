import { UserButton } from "@clerk/nextjs";

export default function Home() {
    return (
        <div>
            This should be an auth route!
            <UserButton />
        </div>
    );
}
