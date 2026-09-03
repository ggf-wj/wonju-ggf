document.addEventListener('DOMContentLoaded', function () {
  var forms = document.querySelectorAll('form[data-submit-type]');

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var type = form.getAttribute('data-submit-type');
      var messageBox = document.getElementById('formMessage');
      var submitBtn = form.querySelector('button[type="submit"]');
      var formData = new FormData(form);
      var payload = { type: type };
      formData.forEach(function (value, key) { payload[key] = value; });

      if (submitBtn) { submitBtn.disabled = true; }

      fetch('/.netlify/functions/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          if (!res.ok) { throw new Error('submit failed'); }
          form.reset();
          form.hidden = true;
          if (messageBox) {
            messageBox.className = 'form-message form-message--success';
            messageBox.textContent = '접수되었습니다. 감사합니다!';
            messageBox.hidden = false;
          }
        })
        .catch(function () {
          if (submitBtn) { submitBtn.disabled = false; }
          if (messageBox) {
            messageBox.className = 'form-message form-message--error';
            messageBox.textContent = '전송에 실패했습니다. 잠시 후 다시 시도해주세요.';
            messageBox.hidden = false;
          }
        });
    });
  });
});
