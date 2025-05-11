export default function Profile() {
  return (
    <div className="p-8">
      <h1 className="text-center text-2xl font-bold text-[#00a0a0] mb-8">我的</h1>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-medium mb-4">学习统计</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span>命名练习</span>
            <span className="text-[#00a0a0] font-medium">12次</span>
          </div>

          <div className="flex justify-between items-center">
            <span>复述练习</span>
            <span className="text-[#00a0a0] font-medium">8次</span>
          </div>

          <div className="flex justify-between items-center">
            <span>扩句练习</span>
            <span className="text-[#00a0a0] font-medium">5次</span>
          </div>

          <div className="flex justify-between items-center">
            <span>看图说话</span>
            <span className="text-[#00a0a0] font-medium">7次</span>
          </div>

          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">测试完成</span>
              <span className="text-[#00a0a0] font-medium">6次</span>
            </div>

            <div className="flex justify-between items-center mt-2">
              <span className="font-medium">平均分数</span>
              <span className="text-[#00a0a0] font-medium">85分</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
