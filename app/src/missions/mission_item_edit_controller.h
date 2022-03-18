#ifndef MISSION_ITEM_EDIT_CONTROLLER_H
#define MISSION_ITEM_EDIT_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionItemEditController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant mission READ mission WRITE setMission NOTIFY missionChanged)
    Q_PROPERTY(int inRouteIndex READ inRouteIndex WRITE setInRouteIndex NOTIFY routeItemChanged)
    Q_PROPERTY(QJsonObject routeItem READ routeItem NOTIFY routeItemChanged)
    Q_PROPERTY(int routeItemsCount READ routeItemsCount NOTIFY missionChanged)
    Q_PROPERTY(QJsonArray itemTypes READ itemTypes NOTIFY missionChanged)
    Q_PROPERTY(QJsonObject itemParameters READ itemParameters NOTIFY routeItemChanged)

public:
    explicit MissionItemEditController(QObject* parent = nullptr);

    QVariant mission() const;
    int inRouteIndex() const;
    QJsonObject routeItem() const;
    int routeItemsCount() const;

    QJsonArray itemTypes() const;

    QJsonObject itemParameters() const;
    Q_INVOKABLE QJsonArray typeParameters(const QString& typeId);

public slots:
    void setMission(const QVariant& missionId);
    void setInRouteIndex(int index);

    void rename(const QString& name);
    void changeItemType(const QString& typeId);
    void setPosition(double latitude, double longitude, float altitude);
    void setParameter(const QString& parameterId, const QVariant& value);

signals:
    void missionChanged();
    void routeItemChanged();

private:
    domain::IMissionsService* const m_missionsService;
    domain::Mission* m_mission = nullptr;
    domain::MissionRouteItem* m_routeItem = nullptr;
};
} // namespace md::presentation

#endif // MISSION_ITEM_EDIT_CONTROLLER_H
