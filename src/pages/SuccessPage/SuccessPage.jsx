import React from "react";
import { Sidebar } from "../../components/Sidebar";
import BusinessOverview from "./BusinessOverview";
import ListSection from "./ListSection";
import "./SuccessPage.scss";

const caseData = {
  businessOverview: {
    businessType: "Kirana Shop",
    location: "Dadar, Mumbai",
    udyamRegistration: { status: "Verified", icon: "✅" },
    electricityBill: { status: "Uploaded", icon: "✅" },
    shopActLicense: { status: "Uploaded", icon: "✅" },
    capturedImages: ["Shopfront", "Product Shelves", "Billing Counter"],
  },
  aiInsights: [
    "Business appears active and well-stocked",
    "Electricity bill indicates timely payments – shows operational stability",
    "Udyam certificate confirms registration under Retail Grocery Trade (Category Code: R12K)",
  ],
  pros: [
    "All primary documents uploaded",
    "Clear interior/shopfront photos support authenticity",
    "Business is registered and in compliance",
    "Location within a dense residential catchment area",
  ],
  potentialGaps: [
    "Residence address proof for the last 3 years still pending",
    "Sales register / purchase invoices yet to be provided",
  ],
  suggestedNextSteps: [
    "FSSAI License (if selling packaged food items) – else mention that no packaged food is sold",
  ],
  suggestedNextStepsSubTitle:
    "💡 In Similar Kirana Shop cases, Credit managers often request: ",
};

const SuccessPage = () => {
  return (
    <div className="success-page">
      <div className="success-sidebar">
        <Sidebar />
      </div>
      <div className="container">
        <h1 className="main-title">Case Summary – Quick Snapshot for RM</h1>
        <BusinessOverview data={caseData.businessOverview} />
        <ListSection
          title="AI Insights (Auto-Extracted via OCR + Image Analysis)"
          items={caseData.aiInsights}
          icon="🔍"
          className="blue"
          subTitle=""
        />
        <ListSection
          title="Pros of this Case"
          items={caseData.pros}
          icon="✅"
          className="green"
          subTitle=""
        />
        <ListSection
          title="Potential Gaps / RM Attention Needed"
          items={caseData.potentialGaps}
          icon="⚠️"
          className="orange"
          subTitle=""
        />
        <ListSection
          title="Suggested Next Steps (Based on Similar Cases)"
          items={caseData.suggestedNextSteps}
          icon="📌"
          className="red"
          subTitle={caseData.suggestedNextStepsSubTitle}
        />

        <div className="collect-data">
          <button>Collect Additional Data</button>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
