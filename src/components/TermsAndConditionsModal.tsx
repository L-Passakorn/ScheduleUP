import React from "react";

const TermsAndConditionsModal = ({
  isModalOpen,
  setIsModalOpen,
  studentDetail,
  setStudentDetail,
}) => {
  if (!isModalOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center font-noto">
      <div
        className="dark:bg-gray-900 p-8 rounded-lg max-w-2xl w-full flex flex-col gap-3"
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "10px",
        }}
      >
        <h2 className="text-2xl mb-4 text-white">ข้อตกลงและเงื่อนไข</h2>
        <div
          className="mb-4 text-gray-300 max-h-96 overflow-y-auto"
          style={{
            paddingInlineStart: "8px", // Adjust padding according to your design
            paddingRight: "8px", // Compensate for scrollbar width
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1)",
            msScrollbarTrackColor: "transparent",
          }}
        >
          <p className="indent-8">
            กรุณาอ่านข้อตกลงและเงื่อนไขเหล่านี้อย่างละเอียดก่อนใช้งานแอปพลิเคชันของเรา
            การใช้งานแอปพลิเคชันนี้แสดงว่าคุณยอมรับข้อตกลงและเงื่อนไขเหล่านี้
            หากคุณไม่ยอมรับข้อตกลงและเงื่อนไขเหล่านี้
            กรุณาอย่าใช้แอปพลิเคชันของเรา
          </p>
          <h3 className="text-lg mt-4 mb-2">1. การเก็บรวบรวมข้อมูล</h3>
          <p>
            เราจะเก็บรวบรวมข้อมูลส่วนบุคคลของคุณ ซึ่งอาจรวมถึงชื่อ นามสกุล
            รูปภาพ หมายเลขนักศึกษา และข้อมูลอื่นๆ ที่เกี่ยวข้องกับการศึกษา
            ข้อมูลเหล่านี้จะถูกใช้เพื่อปรับปรุงบริการและประสบการณ์การใช้งานของคุณ
          </p>
          <h3 className="text-lg mt-4 mb-2">2. การใช้ข้อมูล</h3>
          <p>
            ข้อมูลที่เรารวบรวมจะถูกใช้เพื่อวัตถุประสงค์ดังต่อไปนี้:
            <ul className="list-disc list-inside">
              <li>การให้บริการและสนับสนุนผู้ใช้งาน</li>
              <li>การปรับปรุงและพัฒนาแอปพลิเคชัน</li>
              <li>การวิเคราะห์ข้อมูลเพื่อปรับปรุงคุณภาพบริการ</li>
              <li>การสื่อสารกับคุณเกี่ยวกับการอัพเดตและข้อเสนอพิเศษ</li>
            </ul>
          </p>
          <h3 className="text-lg mt-4 mb-2">3. การเปิดเผยข้อมูล</h3>
          <p>
            เราจะไม่เปิดเผยข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สามยกเว้นในกรณีดังต่อไปนี้:
            <ul className="list-disc list-inside">
              <li>เพื่อให้บริการหรือดำเนินการตามคำขอของคุณ</li>
              <li>เพื่อปฏิบัติตามกฎหมายหรือข้อบังคับ</li>
              <li>เพื่อปกป้องสิทธิ์ ความปลอดภัย และทรัพย์สินของเรา</li>
            </ul>
          </p>
          <h3 className="text-lg mt-4 mb-2">4. ความปลอดภัยของข้อมูล</h3>
          <p>
            เราจะดำเนินมาตรการที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึงที่ไม่ได้รับอนุญาต
            การเปิดเผย การเปลี่ยนแปลง หรือการทำลายข้อมูล
          </p>
          <h3 className="text-lg mt-4 mb-2">5. สิทธิของผู้ใช้งาน</h3>
          <p>
            คุณมีสิทธิ์ในการเข้าถึง แก้ไข และลบข้อมูลส่วนบุคคลของคุณ
            หากคุณต้องการดำเนินการดังกล่าว
            กรุณาติดต่อเราผ่านทางช่องทางที่ระบุในแอปพลิเคชัน
          </p>
          <h3 className="text-lg mt-4 mb-2">
            6. การเปลี่ยนแปลงข้อตกลงและเงื่อนไข
          </h3>
          <p>
            เราขอสงวนสิทธิ์ในการเปลี่ยนแปลงข้อตกลงและเงื่อนไขเหล่านี้ได้ทุกเมื่อ
            การเปลี่ยนแปลงจะมีผลบังคับใช้เมื่อเราโพสต์ข้อตกลงและเงื่อนไขใหม่ในแอปพลิเคชันของเรา
            กรุณาตรวจสอบข้อตกลงและเงื่อนไขเป็นระยะเพื่อให้คุณรับทราบถึงการเปลี่ยนแปลง
          </p>
          <h3 className="text-lg mt-4 mb-2">7. การติดต่อเรา</h3>
          <p>
            หากคุณมีคำถามหรือข้อสงสัยเกี่ยวกับข้อตกลงและเงื่อนไขเหล่านี้
            กรุณาติดต่อเราผ่านทางช่องทางที่ระบุในแอปพลิเคชัน
          </p>
        </div>
        <button
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-800 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          onClick={() => {
            setStudentDetail({ ...studentDetail, isVerify: true });
            setIsModalOpen(false);
            console.log(studentDetail);
          }}
        >
          ยอมรับข้อตกลงและเงื่อนไข
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditionsModal;
