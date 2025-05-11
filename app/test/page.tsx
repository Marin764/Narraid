import Link from "next/link"

export default function Test() {
  return (
    <div className="p-8">
      <h1 className="text-center text-2xl font-bold text-[#00a0a0] mb-12">NarrAid</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/test/naming" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">命名测试</span>
        </Link>

        <Link href="/test/retelling" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">复述测试</span>
        </Link>

        <Link href="/test/expansion" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">扩句测试</span>
        </Link>

        <Link href="/test/description" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">
            看图说话
            <br />
            测试
          </span>
        </Link>
      </div>
    </div>
  )
}
