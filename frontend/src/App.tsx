import Step1 from './pages/validation/Step1DataSource';
import Step2 from './pages/validation/Step2PVI';
import Step3 from './pages/validation/Step3ULOC';
import { useValidationStore } from './store/validationStore';

export default function App() {
  const step = useValidationStore((s) => s.step);

  return (
    <>
      {step === 1 && <Step1 />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
    </>
  );
}
