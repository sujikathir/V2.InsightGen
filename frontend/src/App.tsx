// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from '@/components/layout/main-layout';
import HomePage from '@/pages/home';
import RegistrationService from '@/pages/services/registration';
import DomainService from '@/pages/services/domain';
import LegalService from '@/pages/services/legal';
import DatabaseInsights from '@/pages/services/database-insights';
import FinanceService from '@/pages/services/finance';
import MarketingService from '@/pages/services/marketing';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/services/registration" element={<RegistrationService />} />
          <Route path="/services/domain" element={<DomainService />} />
          <Route path="/services/legal" element={<LegalService />} />
          <Route path="/services/database-insights" element={<DatabaseInsights />} />
          <Route path="/services/finance" element={<FinanceService />} />
          <Route path="/services/marketing" element={<MarketingService />} />
        </Routes>
      </MainLayout>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;