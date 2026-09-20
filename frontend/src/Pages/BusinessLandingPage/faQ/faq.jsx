import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import "./faq.scss";

const faqs = [
  {
    q: "How does the NFC card work?",
    a: `Tap your NSG NFC card on any smartphone and your digital profile opens instantly (no app required).Your connection can save your details, or share their contact details in seconds.`,
  },
  {
    q: "What’s included with the NFC card?",
    a: `Your purchase includes:

• Metal NFC premium card  
• Fully customizable digital profile linked with the card  
• Built-in contact management  
• Email signature integration  
• 7,000+ application integrations via Zapier  



It’s more than a card, it’s a complete business networking tool.`,
  },
  {
    q: "Will this work on iPhone and Android?",
    a: `Yes. NSG works with all modern iPhones and most NFC-enabled Android devices.For older devices, the QR code can be scanned, ensuring your profile is always accessible.`,
  },
  {
    q: "What if my job or business details change?",
    a: `Update your information anytime in your NSG profile.Your card instantly reflects the latest version (no reprinting required).Prefer a refreshed physical card? Enjoy 60% off.`,
  },
  {
    q: "Are there any recurring fees?",
    a: `No subscriptions. No hidden charges.You pay once for your NFC card and receive lifetime access to your digital profile.`,
  },
  {
    q: "What if I lose or damage my card?",
    a: `Enjoy lifetime protection against loss or damage.If your card is ever lost or damaged, we’ll replace it and cover 60% of the cost.`,
  },
  {
    q: "What is our Return and Exchange policy?",
    a: `NSG NFC cards are custom-made and carefully checked before shipping. If there's any error on our end (wrong name, design, printing issue) or manufacturing defect, we'll replace it free of charge. We're here to make it right`,
  },
];

export default function FAQ({ activeIndex, setActiveIndex }) {
  return (
    <section className="faq" id="faq-section">
      <h2>Everything You Need To Know</h2>

      <div className="faq__box">
        {faqs.map((item, i) => (
          <div
            key={i}
            className={`faq__item ${activeIndex === i ? "active" : ""}`}
            onClick={() => setActiveIndex(activeIndex === i ? null : i)}
          >
            <div className="faq__question">
              <span>{item.q}</span>
              <KeyboardArrowDownIcon
                className={activeIndex === i ? "rotate" : ""}
              />
            </div>

            <div className="faq__answer">
              {item.a.split("\n").map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
