document.addEventListener("DOMContentLoaded", function () {
  if (!window.Bikershood) {
    return;
  }

  const form = document.getElementById("contactForm");
  const quickBtn = document.getElementById("contactWhatsAppBtn");

  if (quickBtn) {
    quickBtn.setAttribute(
      "href",
      window.Bikershood.getWhatsAppLink(
        "Hi Bikershood, I need help choosing compatible accessories for my bike."
      )
    );
  }

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = (document.getElementById("name") || {}).value || "Rider";
    const phone = (document.getElementById("phone") || {}).value || "Not provided";
    const bike = (document.getElementById("bikeModel") || {}).value || "Not specified";
    const message = (document.getElementById("message") || {}).value || "Need product help";

    const whatsappMessage = [
      "Hi Bikershood Team,",
      "",
      "Name: " + name,
      "Phone: " + phone,
      "Bike Model: " + bike,
      "Message: " + message
    ].join("\n");

    window.location.href = window.Bikershood.getWhatsAppLink(whatsappMessage);
  });
});
