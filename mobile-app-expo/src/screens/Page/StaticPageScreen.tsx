import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from '../../theme/tokens';

// ── Static content per page ─────────────────────────────────────────────────

const PAGE_CONTENT: Record<string, { title: string; icon: string; sections: { heading?: string; content: string }[] }> = {
  membership: {
    title: 'Chương Trình Thành Viên',
    icon: '🏆',
    sections: [
      { heading: 'Cấp độ thành viên', content: 'CinemaX Rewards có 3 cấp độ: Silver, Gold và Platinum. Mỗi cấp mang lại đặc quyền và ưu đãi khác nhau.' },
      { heading: 'Silver (0 - 999.999₫)', content: '• Tích 1 điểm/1.000₫ chi tiêu\n• Ưu tiên đặt vé trực tuyến\n• Nhận thông báo phim mới' },
      { heading: 'Gold (1.000.000 - 4.999.999₫)', content: '• Tích 1,5 điểm/1.000₫ chi tiêu\n• Giảm 10% giá vé vào thứ 3\n• Combo bắp nước ưu đãi\n• Sinh nhật tặng 1 vé miễn phí' },
      { heading: 'Platinum (5.000.000₫ trở lên)', content: '• Tích 2 điểm/1.000₫ chi tiêu\n• Giảm 15% tất cả ngày\n• Ưu tiên ghế tốt nhất\n• Lounge VIP riêng tại rạp\n• Vé ra mắt độc quyền' },
      { heading: 'Quy đổi điểm', content: '1.000 điểm = 10.000₫ chiết khấu khi mua vé. Điểm có hiệu lực 24 tháng từ ngày tích lũy.' },
    ],
  },
  faq: {
    title: 'Câu Hỏi Thường Gặp',
    icon: '❓',
    sections: [
      { heading: 'Làm thế nào để đặt vé?', content: 'Chọn phim → Chọn suất chiếu → Chọn ghế → Thanh toán. Chỉ mất 60 giây!' },
      { heading: 'Tôi có thể hủy vé không?', content: 'Vé đã mua không thể hủy hoặc hoàn tiền, ngoại trừ trường hợp suất chiếu bị hủy bởi CinemaX.' },
      { heading: 'Thanh toán bằng gì?', content: 'Chúng tôi chấp nhận: MoMo, ZaloPay, VNPay, Thẻ Visa/Mastercard, và các ví điện tử phổ biến.' },
      { heading: 'Vé điện tử hoạt động thế nào?', content: 'Sau khi thanh toán, bạn nhận vé điện tử qua app. Mã QR trên vé được quét tại cổng vào rạp.' },
      { heading: 'Quên mật khẩu phải làm gì?', content: 'Nhấn "Quên mật khẩu" trên màn hình đăng nhập, nhập email và làm theo hướng dẫn được gửi đến email của bạn.' },
      { heading: 'Điểm thưởng có hết hạn không?', content: 'Điểm thưởng có hiệu lực 24 tháng từ ngày tích lũy. Hoạt động thường xuyên giúp điểm không bị hết hạn.' },
    ],
  },
  terms: {
    title: 'Điều Khoản Sử Dụng',
    icon: '📋',
    sections: [
      { heading: '1. Điều khoản chung', content: 'Bằng cách sử dụng ứng dụng CinemaX, bạn đồng ý với các điều khoản và điều kiện này. Vui lòng đọc kỹ trước khi sử dụng.' },
      { heading: '2. Tài khoản người dùng', content: 'Bạn chịu trách nhiệm bảo mật thông tin tài khoản. Không chia sẻ mật khẩu cho người khác. Một người chỉ được tạo một tài khoản.' },
      { heading: '3. Mua vé & thanh toán', content: 'Tất cả giao dịch đều được xử lý qua cổng thanh toán bảo mật. Giá vé có thể thay đổi tùy theo suất chiếu và rạp.' },
      { heading: '4. Quy định sử dụng', content: 'Nghiêm cấm quay phim, chụp ảnh trong rạp. Cư xử lịch sự và tôn trọng khán giả xung quanh.' },
    ],
  },
  payment_policy: {
    title: 'Chính Sách Thanh Toán',
    icon: '💳',
    sections: [
      { heading: 'Phương thức thanh toán', content: 'CinemaX chấp nhận thanh toán qua: Ví MoMo, ZaloPay, VNPay, Thẻ Visa/Mastercard và các ví điện tử phổ biến. Tất cả giao dịch đều được mã hóa SSL.' },
      { heading: 'Xác nhận thanh toán', content: 'Sau khi thanh toán thành công, vé điện tử sẽ được gửi ngay trong ứng dụng. Mã QR có hiệu lực đến hết suất chiếu.' },
      { heading: 'Chính sách hoàn tiền', content: 'Vé đã mua không thể hoàn tiền ngoại trừ trường hợp suất chiếu bị hủy bởi CinemaX. Trong trường hợp lỗi hệ thống, hoàn tiền sẽ được xử lý trong 3-7 ngày làm việc.' },
      { heading: 'Bảo mật thanh toán', content: 'CinemaX không lưu trữ thông tin thẻ tín dụng/ghi nợ. Mọi dữ liệu thanh toán được xử lý qua cổng thanh toán bảo mật PCI DSS Level 1.' },
      { heading: 'Hóa đơn điện tử', content: 'Khách hàng có thể yêu cầu hóa đơn điện tử (VAT) trong vòng 30 ngày kể từ ngày giao dịch qua mục Lịch sử giao dịch trong ứng dụng.' },
    ],
  },
  cinema_rules: {
    title: 'Nội Quy Rạp Chiếu',
    icon: '🎭',
    sections: [
      { heading: 'Quy định chung', content: '• Nghiêm cấm quay phim, chụp ảnh trong suất chiếu\n• Không mang thức ăn, đồ uống từ bên ngoài vào rạp\n• Tắt hoặc để điện thoại chế độ im lặng\n• Không hút thuốc trong rạp và khuôn viên' },
      { heading: 'Kiểm soát độ tuổi', content: 'Khán giả phải xuất trình giấy tờ tùy thân khi xem phim có giới hạn độ tuổi:\n• C18: Chỉ khán giả từ 18 tuổi trở lên\n• C16: Chỉ khán giả từ 16 tuổi trở lên\n• C13: Chỉ khán giả từ 13 tuổi trở lên\n• P: Phim dành cho mọi lứa tuổi' },
      { heading: 'Quy định về ghế ngồi', content: 'Khán giả vui lòng ngồi đúng số ghế ghi trên vé. Tuyệt đối không đổi ghế hoặc chiếm chỗ người khác. Khu vực Sweetbox chỉ dành cho cặp đôi đã đặt vé loại này.' },
      { heading: 'Trẻ em và trẻ sơ sinh', content: 'Trẻ em dưới 3 tuổi được vào rạp miễn phí nhưng không có chỗ ngồi riêng. Phụ huynh chịu trách nhiệm đảm bảo trẻ không gây ồn ào làm phiền khán giả khác.' },
      { heading: 'Xử lý vi phạm', content: 'CinemaX có quyền yêu cầu khách vi phạm nội quy rời khỏi rạp mà không hoàn tiền. Hành vi gian lận vé hoặc tấn công nhân viên sẽ bị xử lý theo pháp luật.' },
    ],
  },
  terms_transaction: {
    title: 'Điều Khoản Giao Dịch',
    icon: '📄',
    sections: [
      { heading: 'Điều khoản mua vé', content: 'Khi hoàn tất thanh toán, giao dịch được coi là đã xác nhận và không thể hủy. Giá vé đã bao gồm phí dịch vụ và không chịu thêm phụ phí nào.' },
      { heading: 'Thay đổi lịch chiếu', content: 'Trong trường hợp CinemaX thay đổi lịch chiếu, khán giả sẽ được thông báo qua email và ứng dụng. CinemaX có trách nhiệm hoàn tiền hoặc đổi vé suất chiếu khác.' },
      { heading: 'Giá vé và phụ thu', content: 'Giá vé có thể thay đổi tùy theo loại phòng chiếu (IMAX, Dolby Atmos, 2D/3D), ngày chiếu và suất chiếu. Phụ thu buổi đêm áp dụng cho các suất từ 22:00.' },
      { heading: 'Chương trình khuyến mãi', content: 'Mã giảm giá và khuyến mãi có thời hạn sử dụng cụ thể. Không thể kết hợp nhiều mã giảm giá trong cùng một giao dịch. CinemaX có quyền thu hồi ưu đãi nếu phát hiện gian lận.' },
    ],
  },
  app_download: {
    title: 'Tải Ứng Dụng',
    icon: "phone-portrait-outline",
    sections: [
      { heading: 'CinemaX trên di động', content: 'Ứng dụng CinemaX có mặt trên cả iOS và Android, được thiết kế để mang đến trải nghiệm đặt vé nhanh nhất và tiện lợi nhất.' },
      { heading: 'Tính năng nổi bật', content: '• Đặt vé nhanh trong 60 giây\n• Lịch chiếu cập nhật theo thời gian thực\n• Vé điện tử với mã QR\n• Tích điểm thưởng tự động\n• Thông báo phim mới và ưu đãi\n• Tìm rạp gần nhất bằng GPS' },
      { heading: 'Tải xuống ngay', content: 'Tìm kiếm "CinemaX" trên App Store (iOS) hoặc Google Play Store (Android) để tải ứng dụng miễn phí. Yêu cầu iOS 14.0+ hoặc Android 8.0+.' },
      { heading: 'Hỗ trợ thiết bị', content: 'Ứng dụng hỗ trợ iPhone, iPad và các thiết bị Android. Dung lượng tải về: ~45MB. Cần kết nối internet để sử dụng đầy đủ tính năng.' },
    ],
  },
  careers: {
    title: 'Tuyển Dụng',
    icon: '💼',
    sections: [
      { heading: 'Gia nhập CinemaX', content: 'CinemaX luôn tìm kiếm những tài năng đam mê điện ảnh và dịch vụ khách hàng. Chúng tôi tạo ra môi trường làm việc năng động, chuyên nghiệp và nhiều cơ hội phát triển.' },
      { heading: 'Vị trí đang tuyển dụng', content: '• Nhân viên phục vụ rạp chiếu (bán thời gian/toàn thời gian)\n• Kỹ thuật viên chiếu phim\n• Nhân viên marketing & digital\n• Lập trình viên mobile/backend\n• Quản lý rạp' },
      { heading: 'Quyền lợi nhân viên', content: '• Xem phim miễn phí cho bản thân và người thân\n• Thưởng hiệu suất theo quý\n• Bảo hiểm sức khỏe toàn diện\n• Đào tạo và phát triển kỹ năng\n• Môi trường làm việc thân thiện' },
      { heading: 'Ứng tuyển', content: 'Gửi CV và thư xin việc về: careers@cinemax.vn\nHoặc liên hệ phòng Nhân sự: 028-1234-5678\nĐịa chỉ: Tầng 2, Vincom Center, Quận 1, TP.HCM' },
    ],
  },
  partners: {
    title: 'Đối Tác',
    icon: '🤝',
    sections: [
      { heading: 'Đối tác thanh toán', content: 'CinemaX hợp tác với các đối tác thanh toán hàng đầu Việt Nam: MoMo, ZaloPay, VNPay, Visa, Mastercard để mang đến trải nghiệm thanh toán an toàn và tiện lợi.' },
      { heading: 'Đối tác công nghệ', content: 'Hệ thống CinemaX được xây dựng trên nền tảng công nghệ tiên tiến với sự hỗ trợ của các đối tác công nghệ quốc tế, đảm bảo hiệu suất và độ tin cậy 99.9%.' },
      { heading: 'Đối tác nội dung', content: 'CinemaX hợp tác với các hãng phim lớn trong nước và quốc tế: Warner Bros., Disney, Universal, BHD, Galaxy Studio, Lotte Entertainment... để mang đến những bộ phim hay nhất.' },
      { heading: 'Hợp tác cùng chúng tôi', content: 'Để hợp tác kinh doanh, quảng cáo hoặc đặt vé theo nhóm doanh nghiệp, vui lòng liên hệ:\nEmail: partner@cinemax.vn\nHotline: 028-1234-5678 (ext. 2)' },
    ],
  },
};

// ── FAQ Accordion Item ────────────────────────────────────────────────────────

const FAQItem = ({ item, index }: { item: { heading?: string; content: string }; index: number }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{item.heading}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#888" />
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{item.content}</Text>
      )}
    </TouchableOpacity>
  );
};

// ── StaticPageScreen ──────────────────────────────────────────────────────────

interface Props {
  navigation: any;
  route: any;
}

export const StaticPageScreen = ({ navigation, route }: Props) => {
  const pageKey = route?.params?.page || 'terms';
  const isFAQ = pageKey === 'faq';
  const page = PAGE_CONTENT[pageKey] || PAGE_CONTENT.terms;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Theme.colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{page.title.toUpperCase()}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Page Icon */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageIcon}>{page.icon}</Text>
          <Text style={styles.pageTitle}>{page.title}</Text>
        </View>

        {/* Sections */}
        {isFAQ ? (
          <View style={styles.faqList}>
            {page.sections.map((section, i) => (
              <FAQItem key={i} item={section} index={i} />
            ))}
          </View>
        ) : (
          page.sections.map((section, i) => (
            <View key={i} style={styles.section}>
              {section.heading && <Text style={styles.sectionHeading}>{section.heading}</Text>}
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))
        )}

        {/* Contact CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaText}>Cần thêm trợ giúp?</Text>
          <TouchableOpacity style={styles.ctaBtn} onPress={() => navigation.navigate('Contact')}>
            <Ionicons name="headset-outline" size={18} color="#000" />
            <Text style={styles.ctaBtnText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const MembershipScreen = (props: Props) => (
  <StaticPageScreen {...props} route={{ params: { page: 'membership' } }} />
);
export const FAQScreen = (props: Props) => (
  <StaticPageScreen {...props} route={{ params: { page: 'faq' } }} />
);
export const TermsScreen = (props: Props) => (
  <StaticPageScreen {...props} route={{ params: { page: 'terms' } }} />
);
export const PrivacyPolicyScreen = (props: Props) => (
  <StaticPageScreen {...props} route={{ params: { page: 'privacy' } }} />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Theme.spacing.md, paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1, borderBottomColor: Theme.colors.cardBorder,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { color: Theme.colors.textPrimary, fontSize: 13, fontWeight: 'bold', flex: 1, textAlign: 'center' },

  content: { padding: Theme.spacing.lg, paddingBottom: 40 },

  pageHeader: { alignItems: 'center', paddingVertical: 24, gap: 12, marginBottom: 8 },
  pageIcon: { fontSize: 48 },
  pageTitle: { color: Theme.colors.textPrimary, fontSize: 22, fontWeight: '800', textAlign: 'center' },

  section: {
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  sectionHeading: {
    color: Theme.colors.warning, fontSize: 14, fontWeight: 'bold', marginBottom: 10,
  },
  sectionContent: { color: Theme.colors.textSecondary, fontSize: 14, lineHeight: 22 },

  // FAQ
  faqList: { gap: 8 },
  faqItem: {
    backgroundColor: Theme.colors.surface, borderRadius: Theme.radius.lg,
    padding: 16, borderWidth: 1, borderColor: Theme.colors.cardBorder,
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  faqQuestion: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: '600', flex: 1, lineHeight: 20 },
  faqAnswer: { color: Theme.colors.textSecondary, fontSize: 13, lineHeight: 21, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Theme.colors.cardBorder },

  ctaSection: { marginTop: 24, alignItems: 'center', gap: 12 },
  ctaText: { color: Theme.colors.textSecondary, fontSize: 14 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Theme.colors.warning, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: Theme.radius.pill,
  },
  ctaBtnText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
