import { useState, useRef, type KeyboardEvent } from 'react';
// ==========================================
// 1. UTILS & KEY HANDLERS
// ==========================================
type KeyHandler = (e: KeyboardEvent<HTMLInputElement>) => void;

const onEnter =
  (callback: KeyHandler) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') callback(e);
  };

const onBackspace =
  (callback: KeyHandler) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') callback(e);
  };

const onArrowLeft =
  (callback: KeyHandler) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowLeft') callback(e);
  };

const onArrowRight =
  (callback: KeyHandler) => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowRight') callback(e);
  };

// ==========================================
// 2. CUSTOM HOOK: useFormFlow
// ==========================================
const useFormFlow = (
  fieldRefs: any,
  flowSteps: string[],
  onComplete?: () => void,
  onCancel?: () => void
) => {
  const handleNext = (currentStep: string) => () => {
    const currentIndex = flowSteps.indexOf(currentStep);
    if (currentIndex === -1) return;
    if (currentIndex === flowSteps.length - 1) {
      onComplete?.();
    } else {
      fieldRefs[flowSteps[currentIndex + 1]]?.focus();
    }
  };

  const handleBack = (currentStep: string) => () => {
    const currentIndex = flowSteps.indexOf(currentStep);
    if (currentIndex === -1) return;
    if (currentIndex === 0) {
      onCancel?.();
    } else {
      fieldRefs[flowSteps[currentIndex - 1]]?.focus();
    }
  };

  const handleNextLoop = (currentStep: string) => () => {
    const currentIndex = flowSteps.indexOf(currentStep);
    if (currentIndex === -1) return;
    if (currentIndex === flowSteps.length - 1) {
      fieldRefs[flowSteps[0]]?.focus();
    } else {
      fieldRefs[flowSteps[currentIndex + 1]]?.focus();
    }
  };

  const handleBackLoop = (currentStep: string) => () => {
    const currentIndex = flowSteps.indexOf(currentStep);
    if (currentIndex === -1) return;
    if (currentIndex === 0) {
      fieldRefs[flowSteps[flowSteps.length - 1]]?.focus();
    } else {
      fieldRefs[flowSteps[currentIndex - 1]]?.focus();
    }
  };

  return {
    handleNext,
    handleBack,
    handleNextLoop,
    handleBackLoop,
  };
};

// ==========================================
// 3. MAIN APP COMPONENT
// ==========================================
function App() {
  const OTP_LENGTH = 6;

  // State quản lý mã OTP
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill('_'));

  // Ref để lưu trữ tham chiếu đến các thẻ input
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // Tạo mảng ['0', '1', '2', '3', '4', '5'] làm steps
  const flowSteps = Array.from({ length: OTP_LENGTH }, (_, i) => String(i));

  // Hàm submit khi nhập xong OTP
  const onSubmit = () => {
    const otp = code.join('');
    alert(`Bạn đã nhập mã OTP: ${otp}`);
  };

  const { handleNext, handleBack, handleNextLoop, handleBackLoop } =
    useFormFlow(fieldRefs.current, flowSteps, onSubmit);

  // Hàm gán Ref cho từng input
  const attachRef = (step: string) => (el: HTMLInputElement | null) => {
    fieldRefs.current[step] = el;
  };

  // Xử lý các phím điều hướng và Backspace
  const handleKeyDown = (e: any, indexStr: string) => {
    onArrowRight(handleNextLoop(indexStr))(e);
    onArrowLeft(handleBackLoop(indexStr))(e);

    onBackspace(() => {
      const newCode = [...code];
      newCode[Number(indexStr)] = '_';
      setCode(newCode);
      handleBack(indexStr)();
    })(e);

    onEnter(() => {
      if (code.filter((item) => item !== '_').length === OTP_LENGTH) {
        onSubmit();
      }
    })(e);
  };

  // Xử lý sự kiện nhập số (Hỗ trợ tốt cho thiết bị Mobile/Android)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    indexStr: string
  ) => {
    const index = Number(indexStr);
    const val = e.target.value;

    // Lấy ký tự số cuối cùng
    const digit = val.replace(/[^0-9]/g, '').slice(-1);

    if (digit) {
      const newCode = [...code];
      newCode[index] = digit;
      setCode(newCode);

      // Nhảy sang ô tiếp theo nếu chưa ở ô cuối
      if (index < OTP_LENGTH - 1) {
        handleNext(indexStr)();
      } else if (index === OTP_LENGTH - 1) {
        // Tự động submit nếu nhập xong số cuối (Tuỳ chọn)
        // onSubmit();
      }
    }
  };

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '50px',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <h1>Nhập mã xác nhận</h1>
      <p>Mã đã được gửi về điện thoại của bạn</p>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center',
          marginTop: '20px',
        }}
      >
        {code.map((digit, index) => (
          <input
            key={index}
            id={'input_' + index}
            name={'input_' + index}
            // Logic hiển thị an toàn cho di động
            value={digit === '_' ? '' : digit}
            placeholder="_"
            onKeyDown={(e) => handleKeyDown(e, `${index}`)}
            onChange={(e) => handleChange(e, `${index}`)}
            maxLength={2}
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            ref={attachRef(`${index}`)}
            style={{
              width: '45px',
              height: '55px',
              fontSize: '24px',
              textAlign: 'center',
              border: '2px solid #ccc',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#007bff')}
            onBlur={(e) => (e.target.style.borderColor = '#ccc')}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
