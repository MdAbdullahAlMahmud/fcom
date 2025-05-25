import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-4">Welcome to fCommerce Admin</h1>
      <Button className="mb-2">Default</Button>
      <Button variant="destructive" className="mb-2">Destructive</Button>
      <Button variant="outline" className="mb-2">Outline</Button>
      <Button variant="secondary" className="mb-2">Secondary</Button>
      <Button variant="ghost" className="mb-2">Ghost</Button>
      <Button variant="link" className="mb-2">Link</Button>
      <button className="mt-4 px-4 py-2 bg-gray-300 rounded text-black">Regular Button</button>
    </main>
  )
}