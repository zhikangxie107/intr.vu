import { getSession } from "@auth0/nextjs-auth0";

export default async function ProfilePage() {
  const session = await getSession();
  const user = session?.user;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-xl mb-4">You’re not logged in</h1>
        <a
          href="/api/auth/login"
          className="bg-black text-white px-4 py-2 rounded-lg"
        >
          Log in
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md text-center">
        <img
          src={user.picture}
          alt={user.name}
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h1 className="text-2xl font-semibold">{user.name}</h1>
        <p className="text-gray-600 mb-4">{user.email}</p>
        <a
          href="/api/auth/logout"
          className="bg-black text-white px-4 py-2 rounded-lg hover:opacity-80"
        >
          Log out
        </a>
      </div>
    </div>
  );
}
