export { default as ActivityModel } from './activity';
export { default as AnnouncementModel } from './announcement';
export { default as AssetModel } from './asset';
export { default as BranchModel } from './branch';
export { default as ChurchModel } from './church';
export { default as ChurchSubscriptionModel } from './church-subscription';
export { default as ContentModel } from './content';
export { default as DemoModel } from './demo';
export { default as DepartmentModel } from './department';
export { default as DiscipleModel } from './disciple';
export { default as DiscipleProgressModel } from './disciple-progress';
export { default as EventModel } from './event';
export { default as GroupModel } from './group';
export { default as LogModel } from './log';
export { default as MessageModel } from './message';
export { default as MessageTemplateModel } from './message-template';
export { default as MilestoneModel } from './milestone';
export { default as OfferingModel } from './offering';
export { default as PaymentModel } from './payment';
export { default as PermissionModel } from './permission';
export { default as PledgeModel } from './pledge';
export { default as PrayerRequestModel } from './prayer-request';
export { default as MessageRecipientModel } from './recipient-group';
export { default as ReportModel } from './report';
export { default as RoleModel } from './role';
export { default as ServiceScheduleModel } from './service-schedule';
export { default as UserModel } from './user';
export { default as UserSubscriptionModel } from './user-subscription';

// This ensures all models are registered
const models = {
  Announcement: require('./announcement').default,
  Asset: require('./asset').default,
  Branch: require('./branch').default,
  ChurchSubscription: require('./church-subscription').default,
  Church: require('./church').default,
  Content: require('./content').default,
  Demo: require('./demo').default,
  Department: require('./department').default,
  DiscipleProgress: require('./disciple-progress').default,
  Disciple: require('./disciple').default,
  Event: require('./event').default,
  Group: require('./group').default,
  MessageTemplate: require('./message-template').default,
  Message: require('./message').default,
  Milestone: require('./milestone').default,
  Offering: require('./offering').default,
  Payment: require('./payment').default,
  Permission: require('./permission').default,
  Pledge: require('./pledge').default,
  PrayerRequest: require('./prayer-request').default,
  Report: require('./report').default,
  Role: require('./role').default,
  UserSubscription: require('./user-subscription').default,
  User: require('./user').default,
  ServiceSchedule: require('./service-schedule').default,
  Activity: require('./activity').default,
};

export default models;
