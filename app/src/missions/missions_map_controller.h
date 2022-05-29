#ifndef MISSIONS_MAP_CONTROLLER_H
#define MISSIONS_MAP_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
class MissionsMapController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QVariant selectedMissionId READ selectedMissionId WRITE selectMission NOTIFY
                   selectedMissionChanged)

public:
    explicit MissionsMapController(QObject* parent = nullptr);

    QVariant selectedMissionId() const;

    Q_INVOKABLE QJsonArray missions() const;
    Q_INVOKABLE QJsonObject route(const QVariant& missionId) const;
    Q_INVOKABLE QJsonArray routeItems(const QVariant& missionId) const;

public slots:
    void selectMission(const QVariant& missionId);
    void updateVisibility(const QVariant& missionId, bool visible);

    void updateRouteItem(const QVariant& missionId, int index, const QJsonObject& routeItemData);

signals:
    void selectedMissionChanged(QVariant missionId);
    void highlightItem(int index);

    void missionAdded(QVariantMap mission);
    void missionRemoved(QVariant missionId);

    void routeItemAdded(QVariant routeId, int index, QVariantMap data);
    void routeItemChanged(QVariant routeId, int index, QVariantMap data);
    void routeItemRemoved(QVariant routeId, int index);

    void centerMission(QVariant missionId);
    void centerRouteItem(QVariant routeId, int index);

private slots:
    void onMissionAdded(domain::Mission* mission);
    void onMissionRemoved(domain::Mission* mission);

private:
    domain::IMissionsService* const m_missions;

    QVariant m_selectedMissionId;
};
} // namespace md::presentation

#endif // MISSIONS_MAP_CONTROLLER_H
