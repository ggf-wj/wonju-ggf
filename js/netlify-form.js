document.addEventListener('DOMContentLoaded', function () {
  var forms = document.querySelectorAll('form[data-netlify="true"]');

  function encode(data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
      })
      .join('&');
  }

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var messageBox = form.querySelector('#formMessage') || document.getElementById('formMessage');
      var submitBtn = form.querySelector('button[type="submit"]');
      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) { payload[key] = value; });

      if (submitBtn) { submitBtn.disabled = true; }

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode(payload)
      })
        .then(function () {
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
