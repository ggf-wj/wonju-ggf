// 자유게시판 글쓰기 / 회원가입 신청을 받아서
// 깃허브 저장소의 data/pending-board.json 또는 data/pending-members.json 파일에
// 자동으로 추가해주는 서버리스 함수.
// 관리자 페이지(/admin)의 "대기중인 신청" 메뉴에서 바로 확인할 수 있게 해줍니다.

const REPO = 'ggf-wj/wonju-ggf';
const BRANCH = 'main';

function today() {
  const d = new Date();
  return d.getFullYear() + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + String(d.getDate()).padStart(2, '0');
}

function escapeText(value) {
  return typeof value === 'string' ? value.trim().slice(0, 2000) : '';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GITHUB_TOKEN이 설정되지 않았습니다.' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid body' }) };
  }

  const type = payload.type === 'membership' ? 'membership' : 'board';

  // 허니팟(스팸 방지): 봇이 채웠으면 조용히 성공 응답만 반환
  if (escapeText(payload.botField)) {
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  const path = type === 'membership' ? 'data/pending-members.json' : 'data/pending-board.json';

  const newItem = type === 'membership'
    ? {
        date: today(),
        name: escapeText(payload.name),
        phone: escapeText(payload.phone),
        email: escapeText(payload.email),
        address: escapeText(payload.address),
        message: escapeText(payload.message)
      }
    : {
        date: today(),
        author: escapeText(payload.name) || '익명',
        email: escapeText(payload.email),
        body: escapeText(payload.message)
      };

  if (type === 'board' && !newItem.body) {
    return { statusCode: 400, body: JSON.stringify({ error: '내용을 입력해주세요.' }) };
  }
  if (type === 'membership' && (!newItem.name || !newItem.phone)) {
    return { statusCode: 400, body: JSON.stringify({ error: '이름과 연락처를 입력해주세요.' }) };
  }

  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const headers = {
    Authorization: `token ${token}`,
    'User-Agent': 'wonju-ggf-site',
    Accept: 'application/vnd.github+json'
  };

  try {
    const getRes = await fetch(`${apiUrl}?ref=${BRANCH}`, { headers });
    if (!getRes.ok) {
      const errText = await getRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'GitHub 파일 조회 실패', detail: errText }) };
    }
    const getData = await getRes.json();
    const currentJson = JSON.parse(Buffer.from(getData.content, 'base64').toString('utf-8'));
    if (!Array.isArray(currentJson.items)) currentJson.items = [];
    currentJson.items.push(newItem);

    const newContentBase64 = Buffer.from(JSON.stringify(currentJson, null, 2), 'utf-8').toString('base64');

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `New ${type} submission via site form`,
        content: newContentBase64,
        sha: getData.sha,
        branch: BRANCH
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      return { statusCode: 502, body: JSON.stringify({ error: 'GitHub 저장 실패', detail: errText }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
