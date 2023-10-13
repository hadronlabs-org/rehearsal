import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";

export const instrumentWallet = async (w: DirectSecp256k1HdWallet, accounts: string[]): Promise<void> => {
    const currentAccounts = await w.getAccounts();
    const accWPrivKeys = await (w as any).getAccountsWithPrivkeys();
    w.getAccounts = async () => {
        const acc = currentAccounts[0];
        return [
            ...currentAccounts,
            ...accounts.map(a => ({
                ...acc,
                address: a,
            }))
        ]
    }
    (w as any).getAccountsWithPrivkeys = async () => {
        const acc = accWPrivKeys[0];
        return [
            ...accWPrivKeys,
            ...accounts.map(a => ({
                ...acc,
                address: a,
            }))
        ]
    }
}
