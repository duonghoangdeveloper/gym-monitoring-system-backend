import { PaymentPlan } from '../../common/models';
import { throwError } from '../../common/services';
import { User } from '../user/user.model';

export const validateCreatorRequired = async creatorId => {
  const creatorExists = await User.exists({
    _id: creatorId,
    role: { $in: ['MANAGER', 'GYM_OWNER', 'SYSTEM_ADMIN'] },
  });
  if (!creatorExists) {
    throwError('Creator not found', 404);
  }
};
export const validateCustomerRequired = async customerId => {
  const customerExists = await User.exists({
    _id: customerId,
    role: 'CUSTOMER',
  });
  if (!customerExists) {
    throwError('Customer not found', 404);
  }
};
export const validatePaymentPlanRequired = async paymentPlanId => {
  const paymentPlanExists = await PaymentPlan.exists({ _id: paymentPlanId });
  if (!paymentPlanExists) {
    throwError('PaymentPlan not found', 404);
  }
};
