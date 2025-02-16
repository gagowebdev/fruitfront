import { useEffect, useState } from "react";
import api from "../api/axiosInstance"; // ✅ Используем общий `axiosInstance`
import { toast } from "react-toastify";

function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [amount, setAmount] = useState<number>(0);
  const [cardNumber, setCardNumber] = useState<string>("");
  const [activeDeposit, setActiveDeposit] = useState<number | null>(null);

  // Загружаем баланс пользователя
  useEffect(() => {
    api.get("/users/me")
      .then((response) => setBalance(response.data.balance))
      .catch(() => toast.error("Ошибка загрузки баланса"));

    const savedDeposit = localStorage.getItem("activeDeposit");
    if (savedDeposit) {
      setActiveDeposit(Number(savedDeposit));
    }
  }, []);


  // Загружаем историю транзакций
  useEffect(() => {
    api.get("/transactions/history")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          setTransactions([]);
        }
      })
      .catch(() => toast.error("Ошибка загрузки транзакций"));
  }, []);

  function formatDateToLocal(dateString: string) {
    if (!dateString) return "⏳";
  
    // 🔥 Разбираем "15-02-2025 13:16" -> [15, 02, 2025, 13, 16]
    const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})/);
    if (!parts) return "❌ Ошибка даты";
  
    const day = parts[1];
    const month = parts[2];
    const year = parts[3];
    const hours = parts[4];
    const minutes = parts[5];
  
    // 📅 Создаём ISO-дату (YYYY-MM-DDTHH:mm)
    const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:00Z`;
  
    // 🔄 Конвертируем в локальный часовой пояс
    const date = new Date(isoDate);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const handleDeposit = () => {
    if (!amount || amount <= 0) {
      return toast.error("Введите сумму для пополнения");
    }

    api.post("/transactions/deposit", { amount, method: "tonkeeper" })
    .then((response) => {
      const { id, link, status } = response.data;

      if (!id) {
        return toast.error("Ошибка: нет ID транзакции");
      }

      toast.success("Перенаправляем в TonKeeper...");
      window.open(link, "_blank");
      setShowDepositForm(false);
      setAmount(0);

      if (status === "created") {
        localStorage.setItem("activeDeposit", String(id));
        setActiveDeposit(id);
      }
    })
    .catch((error) => {
      if (error.response?.data?.message === "У вас уже есть активный депозит. Завершите его перед созданием нового.") {
        toast.error("Вы уже начали депозит. Подтвердите или отмените его!");
      } else {
        toast.error("Ошибка при пополнении");
      }
    });

  };

  const handleWithdraw = () => {
    if (!amount || amount < 100) {
      return toast.error("Минимальная сумма вывода — 100 AMD");
    }
    if (!cardNumber.trim()) {
      return toast.error("Введите номер карты");
    }
    if (balance < amount) {
      return toast.error("Недостаточно средств");
    }
  
    api.post("/transactions/withdraw", { amount, recipient: cardNumber })
      .then(() => {
        toast.success("Запрос на вывод отправлен");
        setShowWithdrawForm(false);
        setAmount(0);
        setCardNumber("");
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Ошибка при выводе");
      });
  };
  
  
  

  return (
    <div className="wallet">
      <h2>Кошелек</h2>

      <div className="wallet-balance">
        <h3>Баланс: {balance} AMD</h3>
      </div>

      <div className="wallet-actions">
        <button 
          onClick={() => setShowDepositForm(true)} 
          disabled={activeDeposit !== null}
        >
          Пополнить
        </button>
        <button onClick={() => setShowWithdrawForm(true)} disabled={balance < 100}>
        Вывести
      </button>
      </div>


      {showDepositForm && (
        <div className="modal">
          <h3>Пополнение</h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Введите сумму"
          />
          <button onClick={handleDeposit}>Отправить</button>
          <button onClick={() => setShowDepositForm(false)}>Отмена</button>
        </div>
      )}

      {showWithdrawForm && (
        <div className="modal">
          <h3>Вывод</h3>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            placeholder="Введите сумму"
          />
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            placeholder="Введите номер карты"
          />
          <button onClick={handleWithdraw}>Отправить</button>
          <button onClick={() => {
            setAmount(0);
            setCardNumber("");
            setShowWithdrawForm(false);
          }}>
            Отмена
          </button>
        </div>
      )}

      {activeDeposit && (
        <div className="deposit-status">
          <p>Вы начали пополнение. Подтвердите оплату:</p>
          <button onClick={() => {
            api.patch(`/admin/transactions/${activeDeposit}/confirm`)
              .then(() => {
                toast.success("Пополнение отправлено на проверку");
                localStorage.removeItem("activeDeposit");
                setActiveDeposit(null);
              })
              .catch(() => toast.error("Ошибка подтверждения"));
          }}>Я оплатил</button>

          <button onClick={() => {
            api.delete(`/transactions/${activeDeposit}/cancel`)
              .then(() => {
                toast.info("Пополнение отменено");
                localStorage.removeItem("activeDeposit");
                setActiveDeposit(null);
              })
              .catch(() => toast.error("Ошибка при отмене"));
          }}>Отмена</button>
        </div>
      )}

      <div className="wallet-history">
        <h3>История транзакций</h3>
        {transactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Сумма</th>
                <th>Тип</th>
                <th>Дата</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.amount} AMD</td>
                  <td>{tx.type === "deposit" ? "Пополнение" : "Вывод"}</td>
                  <td>{formatDateToLocal(tx.created_at)}</td>
                  <td>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Транзакций пока нет</p>
        )}
      </div>
    </div>
  );
}

export default WalletPage;
