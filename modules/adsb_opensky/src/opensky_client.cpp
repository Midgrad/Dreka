#include "opensky_client.h"

#include <QDebug>
#include <QJsonDocument>
#include <QJsonObject>
#include <QNetworkReply>

// API: https://opensky-network.org/apidoc/rest.html

namespace
{
constexpr char baseUrl[] = "https://opensky-network.org/api";
constexpr char states[] = "states";
} // namespace

using namespace dreka::domain;

OpenskyClient::OpenskyClient(QObject* parent) : QObject(parent)
{
    connect(&m_manager, &QNetworkAccessManager::finished, this, &OpenskyClient::onFinished);
}

void OpenskyClient::start()
{
    this->get("/states/all");
}

void OpenskyClient::get(const QString& request)
{
    auto reply = m_manager.get(QNetworkRequest(QNetworkRequest(QUrl(baseUrl + request))));
}

void OpenskyClient::onFinished(QNetworkReply* reply)
{
    if (reply->error() == QNetworkReply::NoError)
    {
        QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
        emit adsbDataReceived(doc.object().value(::states).toArray());
    }
    else
    {
        qWarning() << reply->errorString();
    }

    reply->deleteLater();

    this->start();
}
