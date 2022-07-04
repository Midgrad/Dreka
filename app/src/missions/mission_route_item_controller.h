#ifndef MISSION_ROUTE_ITEM_CONTROLLER_H
#define MISSION_ROUTE_ITEM_CONTROLLER_H

#include "i_missions_service.h"

namespace md::presentation
{
class MissionRouteItemController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant missionId READ missionId WRITE selectMission NOTIFY missionChanged)
    Q_PROPERTY(int inRouteIndex READ inRouteIndex WRITE setInRouteIndex NOTIFY routeItemChanged)
    Q_PROPERTY(QVariantMap routeItem READ routeItem NOTIFY routeItemChanged)
    Q_PROPERTY(QVariantList typeParameters READ typeParameters NOTIFY routeItemChanged)
    Q_PROPERTY(QVariantMap itemParameters READ itemParameters NOTIFY routeItemChanged)

public:
    explicit MissionRouteItemController(QObject* parent = nullptr);

    QVariant missionId() const;
    int inRouteIndex() const;
    QVariantMap routeItem() const;
    QVariantList typeParameters() const;
    QVariantMap itemParameters() const;

    Q_INVOKABLE QVariantList itemTypes(int index) const;

public slots:
    void selectMission(const QVariant& missionId);
    void setInRouteIndex(int inRouteIndex);

    void remove();
    void rename(const QString& name);
    void changeItemType(const QString& typeId);
    void setPosition(const QVariantMap& position);
    void setParameter(const QString& parameterId, const QVariant& value);
    void addNewItem(const QString& typeId, const QVariantMap& position);

signals:
    void missionChanged();
    void routeItemChanged();

private:
    domain::IMissionsService* const m_missions;
    domain::Mission* m_mission = nullptr;
    domain::MissionRouteItem* m_routeItem = nullptr;
    int m_inRouteIndex = -1;
};
} // namespace md::presentation

#endif // MISSION_ROUTE_ITEM_CONTROLLER_H
