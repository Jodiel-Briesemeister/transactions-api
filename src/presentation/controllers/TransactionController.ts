import { Request, Response } from 'express';
import { DepositUseCase } from '@application/usecases/transaction/DepositUseCase';
import { WithdrawUseCase } from '@application/usecases/transaction/WithdrawUseCase';
import { TransferUseCase } from '@application/usecases/transaction/TransferUseCase';
import { GetBalanceUseCase } from '@application/usecases/transaction/GetBalanceUseCase';
import { ListTransactionsUseCase } from '@application/usecases/transaction/ListTransactionsUseCase';
import { listTransactionsSchema } from '@application/schemas/transaction';

export class TransactionController {
  constructor(
    private depositUseCase: DepositUseCase,
    private withdrawUseCase: WithdrawUseCase,
    private transferUseCase: TransferUseCase,
    private getBalanceUseCase: GetBalanceUseCase,
    private listTransactionsUseCase: ListTransactionsUseCase,
  ) {}

  async deposit(req: Request, res: Response) {
    await this.depositUseCase.execute({
      userId: req.userId,
      amount: req.body.amount,
    });

    res.status(201).json({ message: 'Deposit completed' });
  }

  async withdraw(req: Request, res: Response) {
    await this.withdrawUseCase.execute({
      userId: req.userId,
      amount: req.body.amount,
    });

    res.status(200).json({ message: 'Withdraw completed' });
  }

  async transfer(req: Request, res: Response) {
    await this.transferUseCase.execute({
      userId: req.userId,
      recipientEmail: req.body.recipientEmail,
      amount: req.body.amount,
    });

    res.status(200).json({ message: 'Transfer completed' });
  }

  async getBalance(req: Request, res: Response) {
    const result = await this.getBalanceUseCase.execute({ userId: req.userId });
    res.status(200).json(result);
  }

  async listTransactions(req: Request, res: Response) {
    const filters = listTransactionsSchema.parse(req.query);

    const result = await this.listTransactionsUseCase.execute({
      userId: req.userId,
      filters,
    });

    res.status(200).json(result);
  }
}
