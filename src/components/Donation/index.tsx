import React from 'react';

import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

const Address = ({ address }: { address: string }) => (
    <Link
        color="secondary"
        href={`https://etherscan.io/address/${address}#tokentxns`}
    >
        {address}
    </Link>
);

const Transaction = ({ txid }: { txid: string }) => (
    <Link
        color="secondary"
        href={`https://etherscan.io/tx/${txid}`}
    >
        {txid}
    </Link>
);

const IUToken = () => (
    <Link
        color="secondary"
        href={'https://etherscan.io/token/0x66bedabee1dc913ee665dbd6eaa1e209e1692363'}
    >
        IU 토큰의 토큰
    </Link>
);

const IUTokenTransfer = (
    { txid, to, amount, message }:
        { txid: string, to: string, amount: number, message: string }
) => (
    <>

        <Typography variant="body1">
            <Transaction txid={txid} />
        </Typography>
        <Typography variant="body1">
            IU 토큰 전송: {amount} IU -> {' '}
            <Address address={to} />
        </Typography>
        <Typography variant="body1" paragraph>
            {message}
        </Typography>
    </>
);

export default class Donation extends React.Component {

    openDonation = () => {
        window.open('https://etherscan.io/address/0xe4ffbf34962fac9402a2af569c7d7c2d5d7c53e8');
    }

    render() {
        return (
            <>
                <Typography variant="h6" paragraph>
                    IU 거래소는 안전하고 유저 친화적인 고주파수 암호화폐 거래소를 만들기 위해 노력하고 있습니다.
                </Typography>
                <Typography variant="body1" paragraph>
                    IU 거래소는 정식 오픈 전까지 유저의 후원으로 개발됩니다.
                </Typography>
                <Typography variant="body1">
                    {'IU 거래소에 후원해주시면, 보내주신 이더리움 주소로 '}
                    <IUToken />
                    을 2000IUT/1$ 비율로 드립니다.
                </Typography>
                <Typography variant="body1" color="error" paragraph>
                    거래소 지갑에서 보내시면 <IUToken />을 받으실 수 없으니 꼭 개인 지갑에서 보내주세요.
                </Typography>
                <Typography variant="body1" paragraph>
                    모든 이더리움의 사용 내역은 투명하게 공개됩니다.
                </Typography>
                <hr />
                <Typography variant="body1">
                    <Transaction txid="0x8154b90b978d06af4e5af2cd8b14d40cb9d01380babd28af2de446be9cb3e9d8" />
                </Typography>
                <Typography variant="body1" paragraph>
                    <IUToken />
                    {' 생성'} (-0.000105492 ETH)
                </Typography>
                <IUTokenTransfer
                    txid="0x8fda90d586927eec22f91f72c77681ebbc784ed2ff00cb36cc47cf06b0452324"
                    to="0x4388b2e37133f470003bb588891ffb22b2176a72"
                    amount={2500}
                    message="이더리움 후원 (0.01000000 ETH)"
                />
                <IUTokenTransfer
                    txid="0xbfcaf33c4c6bbe527c7c859647f2b43df858c0ff831720a3fd7b82a52184c74d"
                    to="0x564ea81daf55b2137f2dbb7c0b0b37915b7dca86"
                    amount={26600}
                    message="이더리움 후원 (0.10000000 ETH)"
                />
                <IUTokenTransfer
                    txid="0x9c99227d79137c799176bd3dd505da2f4d89b7ceec3d687cefbb3e9a73df1a99"
                    to="0xf7ba5d63864f249391270a903b210504b23f2a96"
                    amount={25132}
                    message="이더리움 후원 (0.10000000 ETH)"
                />
                <IUTokenTransfer
                    txid="0x7fed1acd2cc6882f8efa957e16816f3b55694d01e6392196ad7d266e3d9d8404"
                    to="0x1955cf1b03dc460ad7172d62bdea9deb80d33e31"
                    amount={21400}
                    message="이더리움 후원 (0.09151770 ETH)"
                />
                <IUTokenTransfer
                    txid="0xea109ecf164da07238bc9a3d5a9a7f645d5a4ce180f2162f657d13d3cb3d2215"
                    to="0x751da97df062076390b143e79af4df9780c7288c"
                    amount={237180}
                    message="이더리움 후원 (1.00000000 ETH)"
                />
                <Typography variant="body1">
                    <a>
                        아직 지불되지 않은 후원 금액 사용
                    </a>
                </Typography>
                <Typography variant="body1">
                    - AWS 서비스 이용료 (EC2 t3.micro) 0.25$
                </Typography>
                <hr />
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={this.openDonation}
                >
                    이더리움 후원 주소
                </Button>
            </>
        );
    }
}
