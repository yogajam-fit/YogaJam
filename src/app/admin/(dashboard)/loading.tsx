import { Loader } from '@/components/ui/Loader'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative font-sans w-full p-8">
      <Loader />
    </div>
  )
}
