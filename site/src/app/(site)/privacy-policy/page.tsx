import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Chính Sách Bảo Mật</h1>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Giới Thiệu</h2>
                        <p className="text-gray-600">
                            Chào mừng đến với Chính Sách Bảo Mật của chúng tôi. Quyền riêng tư của bạn là vô cùng quan trọng đối với chúng tôi. Chính sách này nêu rõ cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Thông Tin Chúng Tôi Thu Thập</h2>
                        <p className="text-gray-600">
                            Chúng tôi thu thập thông tin mà bạn cung cấp trực tiếp cho chúng tôi, chẳng hạn như khi bạn tạo tài khoản, điền vào biểu mẫu hoặc liên lạc với chúng tôi. Điều này có thể bao gồm:
                        </p>
                        <ul className="list-disc list-inside text-gray-600">
                            <li>Tên và thông tin liên lạc</li>
                            <li>Thông tin đăng nhập tài khoản</li>
                            <li>Dữ liệu sử dụng và sở thích</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Cách Chúng Tôi Sử Dụng Thông Tin Của Bạn</h2>
                        <p className="text-gray-600">
                            Chúng tôi sử dụng thông tin thu thập được để:
                        </p>
                        <ul className="list-disc list-inside text-gray-600">
                            <li>Cung cấp và cải thiện dịch vụ của chúng tôi</li>
                            <li>Cá nhân hóa trải nghiệm của bạn</li>
                            <li>Liên lạc với bạn về các cập nhật hoặc khuyến mãi</li>
                        </ul>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Chia Sẻ Thông Tin Của Bạn</h2>
                        <p className="text-gray-600">
                            Chúng tôi không chia sẻ thông tin cá nhân của bạn với bên thứ ba ngoại trừ khi cần thiết để cung cấp dịch vụ, tuân thủ các nghĩa vụ pháp lý hoặc được sự đồng ý của bạn.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">5. Liên Hệ Với Chúng Tôi</h2>
                        <p className="text-gray-600">
                            Nếu bạn có bất kỳ câu hỏi nào về Chính Sách Bảo Mật này, vui lòng liên hệ với chúng tôi tại{' '}
                            <a href="mailto:it@tazagroup.vn" className="text-blue-600 hover:underline">
                                it@tazagroup.vn
                            </a>.
                        </p>
                    </section>

                    <div className="mt-8">
                        <Link href="/" className="text-blue-600 hover:underline">
                            Quay về Trang Chủ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}