document.addEventListener('DOMContentLoaded', function () {
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobileNav');

  hamburger.addEventListener('click', function () {
    var isOpen = mobileNav.classList.toggle('is-open');
    hamburger.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  mobileNav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      mobileNav.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  var chairmanPhoto = document.getElementById('chairmanPhoto');
  var chairmanFallback = document.getElementById('chairmanPhotoFallback');
  if (chairmanPhoto && chairmanFallback) {
    chairmanPhoto.addEventListener('error', function () {
      chairmanPhoto.hidden = true;
      chairmanFallback.hidden = false;
    });
  }

  var newsList = document.getElementById('newsList');
  if (newsList) {
    fetch('data/news.json')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var items = (data && data.items) || [];
        newsList.innerHTML = '';
        if (items.length === 0) {
          var empty = document.createElement('p');
          empty.className = 'news-loading';
          empty.textContent = '등록된 소식이 없습니다.';
          newsList.appendChild(empty);
          return;
        }
        items.forEach(function (item) {
          var a = document.createElement('a');
          a.className = 'news-item';
          a.href = item.link || '#';

          var date = document.createElement('span');
          date.className = 'news-date';
          date.textContent = item.date || '';

          var title = document.createElement('span');
          title.className = 'news-title';
          title.textContent = item.title || '';

          var arrow = document.createElement('span');
          arrow.className = 'news-arrow';
          arrow.textContent = '→';

          a.appendChild(date);
          a.appendChild(title);
          a.appendChild(arrow);
          newsList.appendChild(a);
        });
      })
      .catch(function () {
        newsList.innerHTML = '';
        var err = document.createElement('p');
        err.className = 'news-loading';
        err.textContent = '소식을 불러오지 못했습니다.';
        newsList.appendChild(err);
      });
  }

  var copyBtn = document.getElementById('copyAccount');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var account = copyBtn.getAttribute('data-account');
      var done = function () {
        var original = '계좌번호 복사';
        copyBtn.textContent = '복사 완료!';
        copyBtn.classList.add('is-copied');
        setTimeout(function () {
          copyBtn.textContent = original;
          copyBtn.classList.remove('is-copied');
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(account).then(done).catch(done);
      } else {
        done();
      }
    });
  }
});
