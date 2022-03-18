#ifndef MISSIONS_CONTROLLER_H
#define MISSIONS_CONTROLLER_H

#include "i_missions_service.h"

#include <QJsonArray>

namespace md::presentation
{
// Separeter on MissionListController & MissionRouteController
class MissionsController : public QObject
{
    Q_OBJECT

    Q_PROPERTY(QJsonArray missionTypes READ missionTypes NOTIFY missionTypesChanged)
    Q_PROPERTY(QVariantList missionIds READ missionIds NOTIFY missionIdsChanged)
    Q_PROPERTY(QVariant selectedMission READ selectedMission NOTIFY selectedMissionChanged)
    Q_PROPERTY(int selectedItemIndex READ selectedItemIndex NOTIFY selectedItemIndexChanged)
    // TODO: remove selected item fromMissionsController

public:
    explicit MissionsController(QObject* parent = nullptr);

    QJsonArray missionTypes() const;
    QVariantList missionIds() const;
    QVariant selectedMission() const;
    int selectedItemIndex() const;

    Q_INVOKABLE QJsonObject routeData(const QVariant& routeId) const;
    Q_INVOKABLE QJsonObject routeItemData(const QVariant& routeId, int index) const;
    Q_INVOKABLE QJsonArray routeItemTypes(const QVariant& routeId) const;
    Q_INVOKABLE QJsonArray patternTypes(const QVariant& routeId) const;

public slots:
    void selectMission(const QVariant& selectedMissionId);
    void selectItemIndex(int index);
    void addNewMission(const QString& missionTypeId);
    void updateRoute(const QVariant& routeId, const QJsonObject& data);
    void renameMission(const QVariant& missionId, const QString& name);
    void removeMission(const QVariant& missionId);
    void addRouteItem(const QVariant& routeId, const QString& typeId, const QVariantMap& position);
    void updateRouteItemData(const QVariant& routeId, int index, const QJsonObject& data);
    void removeItem(const QVariant& routeId, int index);

signals:
    void missionTypesChanged();
    void missionIdsChanged();
    void selectedMissionChanged(QVariant missionId);
    void selectedItemIndexChanged(int index);

    void missionAdded(QVariant missionId);
    void missionRemoved(QVariant missionId);
    void missionChanged(QVariant missionId);

    void routeItemAdded(QVariant routeId, int index);
    void routeItemRemoved(QVariant routeId, int index);
    void routeItemChanged(QVariant routeId, int index);

    void centerRoute(QVariant routeId);
    void centerRouteItem(QVariant routeId, int index);

private slots:
    void onMissionAdded(domain::Mission* mission);
    void onMissionRemoved(domain::Mission* mission);

private:
    domain::IMissionsService* const m_missionsService;

    domain::Mission* m_selectedMission = nullptr;
    int m_selectedItemIndex = -1;
};
} // namespace md::presentation

#endif // MISSIONS_CONTROLLER_H
