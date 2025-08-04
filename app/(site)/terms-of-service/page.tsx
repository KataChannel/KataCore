import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Điều Khoản Dịch Vụ</h1>
                <div className="bg-white shadow-md rounded-lg p-6">
                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">1. Chấp Nhận Điều Khoản</h2>
                        <p className="text-gray-600">
                            Bằng việc truy cập hoặc sử dụng dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này. Nếu bạn không đồng ý, vui lòng không sử dụng dịch vụ của chúng tôi.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">2. Sử Dụng Dịch Vụ</h2>
                        <p className="text-gray-600">
                            Bạn đồng ý chỉ sử dụng dịch vụ của chúng tôi cho các mục đích hợp pháp và theo cách không vi phạm quyền của người khác hoặc hạn chế việc sử dụng dịch vụ của họ.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">3. Trách Nhiệm Tài Khoản</h2>
                        <p className="text-gray-600">
                            Bạn có trách nhiệm duy trì tính bảo mật của thông tin đăng nhập tài khoản và chịu trách nhiệm cho tất cả các hoạt động xảy ra dưới tài khoản của bạn.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">4. Chấm Dứt</h2>
                        <p className="text-gray-600">
                            Chúng tôi có quyền tạm ngừng hoặc chấm dứt quyền truy cập dịch vụ của bạn theo quyết định của chúng tôi, có hoặc không có thông báo, đối với bất kỳ vi phạm nào của các điều khoản này.
                        </p>
                    </section>

                    <section className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">5. Liên Hệ Chúng Tôi</h2>
                        <p className="text-gray-600">
                            Nếu bạn có bất kỳ câu hỏi nào về Điều khoản Dịch vụ này, vui lòng liên hệ với chúng tôi tại{' '}
                            <a href="mailto:it@tazagroup.vn" className="text-blue-600 hover:underline">
                                it@tazagroup.vn
                            </a>.
                        </p>
                    </section>

                    <div className="mt-8">
                        <Link href="/" className="text-blue-600 hover:underline">
                            Quay Về Trang Chủ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}