import Navbar from "../components/navbar/navbar";


export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Left sidebar */}
      <Navbar />

      {/* Main content */}
      <main style={{ marginLeft: "6rem", padding: "2rem" }}>
        <p>hello world</p>
      </main>
    </div>
  );
}