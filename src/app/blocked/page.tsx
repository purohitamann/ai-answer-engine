// import styles from "@/styles/Home.module.css";

export default function Blocked() {
    return (
        <div className="flex flex-col min-h-screen items-center justify-center font-sans">
            <main className="bg-white opacity-40 p-8 rounded shadow-md text-center">
                <h3 className="text-2xl  text-gray-900 font-semibold mb-4">Access Blocked</h3>
                <p className="text-gray-700">You have exceeded the rate limit. Please try again in 15 minutes.</p>
            </main>
        </div>
    );
}


