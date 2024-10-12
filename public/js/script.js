/* Show/Hide password */
document.addEventListener("DOMContentLoaded", function() {
    const pswdBtn = document.querySelector("#pswdBtn");
    pswdBtn.addEventListener("click", function() {
      const pswdInput = document.getElementById("pword");
      const type = pswdInput.getAttribute("type");
      if (type == "password") {
        pswdInput.setAttribute("type", "text");
        pswdBtn.innerHTML = "Hide Password";
      } else {
        pswdInput.setAttribute("type", "password");
        pswdBtn.innerHTML = "Show Password";
      }
    });
  });

  /* Miles Validation */
  document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('inventoryForm').addEventListener('submit', function(event) {
        const milesInput = document.getElementById('miles');
        // Check if the value includes a decimal point
        if (milesInput.value.includes('.')) {
            event.preventDefault(); // Prevent form submission
            alert("Miles must be a whole number without decimal points."); // Display alert
            milesInput.focus(); // Focus on the miles input
        }
    });
});