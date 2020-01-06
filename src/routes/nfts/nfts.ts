import { steemConnectJson } from 'common/steem';
import { customJson } from 'common/keychain';
import { TokenInfoModal } from 'modals/wallet/token-info';
import { State } from 'store/state';
import { SteemEngine } from 'services/steem-engine';
import { autoinject, TaskQueue } from 'aurelia-framework';

import { environment } from 'environment';

import { connectTo, dispatchify } from 'aurelia-store';
import { getNfts } from 'store/actions';

import styles from './nfts.module.css';
import { DialogService, DialogCloseResult } from 'aurelia-dialog';

@autoinject()
@connectTo()
export class Nfts {
    private styles = styles;
    private tokenTable: HTMLTableElement;
    private state: State;

    constructor(private se: SteemEngine, private taskQueue: TaskQueue, private dialogService: DialogService) {}

    async canActivate() {
        await dispatchify(getNfts)();
    }

    async walletDialogCloseResponse(response: DialogCloseResult) {
        console.log(response);
    }

    attached() {
        // @ts-ignore
        $(this.tokenTable).DataTable({
            order: [],
            columnDefs: [
                {
                    targets: 'no-sort',
                    orderable: false,
                },
            ],
            bInfo: false,
            paging: false,
            searching: false,
        });
    }

    showTokenInfo(symbol) {
        this.dialogService.open({ viewModel: TokenInfoModal, model: symbol }).whenClosed(response => {
            //console.log(response);
        });
    }

    enableMarket(symbol: string) {
        const payload = {
            contractName: 'nftmarket',
            contractAction: 'enableMarket',
            contractPayload: {
                symbol: symbol
            }
        };

        if (window.steem_keychain) {
            customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(payload), `Enable Market`)
        } else {
            steemConnectJson(this.se.getUser(), 'active', payload);
        }
    }

    setGroupBy(symbol: string, properties: string[]) {
        const payload = {
            contractName: 'nft',
            contractAction: 'setGroupBy',
            contractPayload: {
                symbol: symbol,
                properties: properties
            }
        };

        if (window.steem_keychain) {
            customJson(this.se.getUser(), environment.chainId, 'Active', JSON.stringify(payload), `Set Group By Properties`)
        } else {
            steemConnectJson(this.se.getUser(), 'active', payload);
        }
    }

    userCanIssue(token) {
        if (token.authorizedIssuingAccounts && token.authorizedIssuingAccounts.includes(this.state.account.name)) {
            return true;
        }

        return false;
    }

    userCanEnableMarket(token) {
        console.log(token);
        if (token.authorizedIssuingAccounts && token.authorizedIssuingAccounts.includes(this.state.account.name) && !token?.groupBy?.length) {
            return true;
        }

        return false;
    }
}
