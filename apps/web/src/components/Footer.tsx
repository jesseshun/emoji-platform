export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Emoji Platform. All rights reserved.</p>
        <p className="mt-1">
          本项目为原创内容，不包含任何竞品代码、文案或图片。
        </p>
      </div>
    </footer>
  );
}
