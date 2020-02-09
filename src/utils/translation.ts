export const gettext = (message: string, values: {[key: string]: any} = {}) => {
    const messages: {[key: string]: string} = {
        'IU Exchange': 'IU 거래소',
        'Exchange': '거래소',
        'Investment History': '투자 내역',
        'Donate Ethereum': '이더리움 후원',
        'Email': '이메일',
        'Password': '비밀번호',
        'Password Confirm': '비밀번호 확인',
        'Please enter an email.': '이메일을 입력해주세요.',
        'Please enter a password.': '비밀번호를 입력해주세요.',
        'Not a valid email.': '유효하지 않은 이메일입니다.',
        'Password must be between 12 and 64 characters.': '비밀번호는 12~64자여야 합니다.',
        'Password must contain an alphabet.': '비밀번호는 영문자를 포함해야 합니다.',
        'Password must contain a number.': '비밀번호는 숫자를 포함해야 합니다.',
        'Please enter a password confirm.': '비밀번호 확인을 입력해주세요.',
        'Please enter the same value as the password.': '비밀번호와 같은 값을 입력해주세요.',
        'Please enter a name.': '이름을 입력해주세요.',
        'Register': '회원가입',
        'Login': '로그인',
        'Logout': '로그아웃',
        'Name': '이름',
        'Price': '가격',
        'Balance': '보유 수량',
        'Estimated Value': '평가 금액',
        'Open': '시가',
        'High': '고가',
        'Low': '저가',
        'Close': '종가',
        'Volume': '거래량',
        'Quantity': '수량',
        'Order Amount': '주문 금액',
        'Size': '규모',
        'Minimum order amount: {{amount}}': '최소 주문 금액: {{amount}}',
        'Maker fee: {{fee}}%': '메이커 수수료: {{fee}}%',
        'Taker fee: {{fee}}%': '테이커 수수료: {{fee}}%',
        'Minimum order amount is {{amount}}.': '최소 주문 금액은 {{amount}} 입니다.',
        'Please check your order price.': '주문 가격을 확인해주세요.',
        'Buy': '매수',
        'Sell': '매도',
        'Usable': '사용 가능',
        'Cancel Orders': '주문 취소',
        'Trade': '거래',
        'Deposit': '입금',
        'Withdrawal': '출금',
        'History': '입출금내역',
        'Deposit & Withdrawal': '입출금',
        '{{currency}} Deposit & Withdrawal': '{{currency}} 입출금',
        'Deposit {{currency}}': '{{currency}} 입금',
        'You can deposit {{currency}} to below address.': '아래 주소로 {{currency}}을(를) 입금하실 수 있습니다.',
        'Create {{currency}} Deposit Address': '{{currency}} 입금 주소 생성',
        '{{currency}} deposits are preparing.': '{{currency}} 입금은 준비 중 입니다.',
        '{{currency}} Deposit Address': '{{currency}} 입금 주소',
        '{{currency}} Withdrawal Address': '{{currency}} 출금 주소',
        'Withdraw {{currency}}': '{{currency}} 출금',
        'Available Withdrawal Amount': '출금 가능 금액',
        'Withdrawal Amount': '출금 금액',
        'Total Withdrawal Amount': '총 출금 금액',
        'Maximum': '최대',
        'Fee': '수수료',
        '{{currency}} deposits are reflected to the balance after {{confirmations}} confirmations.': '{{currency}} 입금은 {{confirmations}} 컨펌 후에 잔고에 반영됩니다.',
        '{{currency}} withdrawals are preparing.': '{{currency}} 출금은 준비 중 입니다.',
        'Minimum deposit amount is {{amount}}.': '최소 입금 금액은 {{amount}} 입니다.',
        'Minimum withdrawal amount is {{amount}}.': '최소 출금 금액은 {{amount}} 입니다.',
        'Invalid address.': '유효하지 않은 주소 입니다.',
        'Not enough balance.': '잔액이 부족합니다.',
        'Date': '날짜',
        'Pending confirmations': '컨펌 대기중',
        'Copy': '복사',
        'Korea Won': '원화',
        'Bitcoin': '비트코인',
        'Ethereum': '이더리움',
        'XRP': '리플',
        'Bitcoin Cash': '비트코인 캐시',
        'EOS': '이오스',
        'Stellar': '스텔라루멘',
        'Tether': '테더',
        'Litecoin': '라이트코인',
        'Bitcoin SV': '비트코인 사토시 비전',
        'TRON': '트론',
        'Information': '안내',
        'Error': '오류',
        'Internal server error has been occurred.': '내부 서버 오류가 발생했습니다.',
        'There is a problem with your internet connection or the server has an error.': '인터넷 연결에 문제가 있거나 서버에서 오류가 발생하였습니다.',
        'Email or password is wrong.': '이메일 또는 비밀번호가 틀립니다.',
        'Email and password are required.': '이메일과 비밀번호는 필수입니다.',
        'The email is already in use.': '이미 사용 중인 이메일 입니다.',
        'OK': '확인',
        'M': '백만',
    };
    let translated = messages[message] || message;
    for (const [key, value] of Object.entries(values)) {
        translated = translated.replace(`{{${key}}}`, value);
    }
    return translated;
};

export const pgettext = (context: string, message: string) => {
    const messages: {[key: string]: {[context: string]: string}} = {

    };
    return messages[message][context] || message;
};
